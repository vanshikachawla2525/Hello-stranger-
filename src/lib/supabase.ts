import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteContent } from '../types/content';

const STORAGE_CUSTOM_URL_KEY = 'hs_supabase_custom_url';
const STORAGE_CUSTOM_KEY_KEY = 'hs_supabase_custom_key';

function cleanEnv(val: string | undefined | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']+|["']+$/g, '').trim();
}

export function isPlaceholder(val: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('your-project') ||
    lower.includes('your-anon') ||
    lower.includes('your-key') ||
    lower.includes('example.com') ||
    lower.includes('placeholder') ||
    lower.includes('<') ||
    lower.includes('>')
  );
}

export function isValidSupabaseUrl(urlString: string): boolean {
  if (!urlString || isPlaceholder(urlString)) return false;
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (!parsed.hostname || isPlaceholder(parsed.hostname)) return false;
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isValidSupabaseKey(keyString: string): boolean {
  if (!keyString || isPlaceholder(keyString)) return false;
  return keyString.length >= 25;
}

function getCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  // 1. Check custom runtime overrides in localStorage
  if (typeof window !== 'undefined') {
    try {
      const customUrl = cleanEnv(localStorage.getItem(STORAGE_CUSTOM_URL_KEY));
      const customKey = cleanEnv(localStorage.getItem(STORAGE_CUSTOM_KEY_KEY));
      if (isValidSupabaseUrl(customUrl) && isValidSupabaseKey(customKey)) {
        return { url: customUrl, anonKey: customKey, isCustom: true };
      }
    } catch {}
  }

  // 2. Check environment variables
  const envUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL);
  const envKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (isValidSupabaseUrl(envUrl) && isValidSupabaseKey(envKey)) {
    return { url: envUrl, anonKey: envKey, isCustom: false };
  }

  return { url: '', anonKey: '', isCustom: false };
}

let activeCredentials = getCredentials();
export let isSupabaseConfigured = Boolean(activeCredentials.url && activeCredentials.anonKey);
let activeClient: SupabaseClient | null = null;

function recomputeClient(): void {
  activeCredentials = getCredentials();
  isSupabaseConfigured = Boolean(activeCredentials.url && activeCredentials.anonKey);

  if (isSupabaseConfigured) {
    try {
      activeClient = createClient(activeCredentials.url, activeCredentials.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      activeClient = null;
      isSupabaseConfigured = false;
    }
  } else {
    activeClient = null;
  }
}

recomputeClient();

export const supabase = activeClient;

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && activeClient !== null;
  },

  getProjectUrl(): string {
    return activeCredentials.url;
  },

  getCredentialsInfo(): { configured: boolean; url: string; isCustom: boolean } {
    return {
      configured: this.isConfigured(),
      url: activeCredentials.url,
      isCustom: activeCredentials.isCustom,
    };
  },

  setCustomCredentials(url: string, anonKey: string): { success: boolean; message?: string } {
    const cleanUrl = cleanEnv(url);
    const cleanKey = cleanEnv(anonKey);

    if (!isValidSupabaseUrl(cleanUrl)) {
      return { success: false, message: 'Invalid Supabase URL. Format: https://<project-ref>.supabase.co' };
    }
    if (!isValidSupabaseKey(cleanKey)) {
      return { success: false, message: 'Invalid Supabase anon key (minimum 25 characters).' };
    }

    try {
      localStorage.setItem(STORAGE_CUSTOM_URL_KEY, cleanUrl);
      localStorage.setItem(STORAGE_CUSTOM_KEY_KEY, cleanKey);
      recomputeClient();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to save credentials to localStorage' };
    }
  },

  clearCustomCredentials(): void {
    try {
      localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
      localStorage.removeItem(STORAGE_CUSTOM_KEY_KEY);
    } catch {}
    recomputeClient();
  },

  // Public read: fetch published document from 'content' table (id = 'published')
  async fetchPublishedContent(): Promise<SiteContent | null> {
    if (!activeClient || !this.isConfigured()) return null;
    try {
      const { data, error } = await activeClient
        .from('content')
        .select('data')
        .eq('id', 'published')
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch notice for published content:', error.message);
        return null;
      }

      if (data && data.data && typeof data.data === 'object') {
        return data.data as SiteContent;
      }
      return null;
    } catch (err) {
      console.warn('Supabase fetch exception for published content:', err);
      return null;
    }
  },

  // Admin write: publish updated content to 'content' table (requires authenticated admin per RLS)
  async publishContent(
    content: SiteContent,
    _note = 'Published update'
  ): Promise<{ success: boolean; error?: string }> {
    if (!activeClient || !this.isConfigured()) {
      return {
        success: false,
        error: 'Supabase is not configured (missing valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)',
      };
    }

    try {
      const payload = {
        id: 'published',
        data: content,
        updated_at: new Date().toISOString(),
      };

      const { error } = await activeClient
        .from('content')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase write notice:', error.message || error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Supabase write exception:', err);
      return { success: false, error: err?.message || 'Failed to publish to Supabase' };
    }
  },

  // Storage upload: uploads a photo file to the 'images' bucket and returns its public HTTPS URL (never base64)
  async uploadPhoto(
    file: File,
    slotId = 'photo'
  ): Promise<{ url: string | null; error?: string }> {
    if (!activeClient || !this.isConfigured()) {
      return {
        url: null,
        error: 'Supabase storage is not configured. Add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Storage.',
      };
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanSlot = slotId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniquePath = `uploads/${cleanSlot}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await activeClient.storage
        .from('images')
        .upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (error) {
        console.warn('Supabase Storage upload notice:', error.message || error);
        return { url: null, error: error.message };
      }

      const { data: urlData } = activeClient.storage.from('images').getPublicUrl(data.path);
      if (!urlData?.publicUrl) {
        return { url: null, error: 'Could not generate public URL for uploaded photo.' };
      }

      return { url: urlData.publicUrl };
    } catch (err: any) {
      console.warn('Supabase Storage upload exception:', err);
      return { url: null, error: err?.message || 'Storage upload failed' };
    }
  },

  // Storage upload: uploads ambient audio track to the 'images' bucket and returns public URL
  async uploadAudio(file: File): Promise<{ url: string | null; error?: string }> {
    if (!activeClient || !this.isConfigured()) {
      return {
        url: null,
        error: 'Supabase storage is not configured.',
      };
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const uniquePath = `audio/ambient_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await activeClient.storage
        .from('images')
        .upload(uniquePath, file, {
          cacheControl: '86400',
          upsert: true,
          contentType: file.type || 'audio/mpeg',
        });

      if (error) {
        console.warn('Supabase Storage audio upload notice:', error.message || error);
        return { url: null, error: error.message };
      }

      const { data: urlData } = activeClient.storage.from('images').getPublicUrl(data.path);
      return { url: urlData?.publicUrl || null };
    } catch (err: any) {
      console.warn('Supabase Storage audio upload exception:', err);
      return { url: null, error: err?.message || 'Audio upload failed' };
    }
  },

  // Authenticate admin session with Supabase Auth so RLS allows authenticated writes
  async signInAdmin(
    email: string,
    passphrase: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!activeClient || !this.isConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { data, error } = await activeClient.auth.signInWithPassword({
        email,
        password: passphrase,
      });

      if (!error && data?.session) {
        return { success: true };
      }

      if (
        error?.message?.toLowerCase().includes('invalid login credentials') ||
        error?.message?.toLowerCase().includes('user not found')
      ) {
        const { data: signUpData, error: signUpErr } = await activeClient.auth.signUp({
          email,
          password: passphrase,
        });

        if (!signUpErr && signUpData?.session) {
          return { success: true };
        }
      }

      return { success: false, error: error?.message || 'Supabase authentication failed' };
    } catch (err: any) {
      console.warn('Supabase authentication notice:', err?.message || err);
      return { success: false, error: err?.message || 'Supabase authentication failed' };
    }
  },

  async signOutAdmin(): Promise<void> {
    if (activeClient) {
      try {
        await activeClient.auth.signOut();
      } catch {}
    }
  },

  // Health / connectivity check
  async checkConnection(): Promise<{
    configured: boolean;
    connected: boolean;
    authenticated: boolean;
    hasContent: boolean;
    message: string;
  }> {
    if (!this.isConfigured() || !activeClient) {
      return {
        configured: false,
        connected: false,
        authenticated: false,
        hasContent: false,
        message: 'Supabase credentials are not configured or placeholder values are present.',
      };
    }

    try {
      const { data, error } = await activeClient
        .from('content')
        .select('id, updated_at')
        .eq('id', 'published')
        .maybeSingle();

      const { data: authData } = await activeClient.auth.getSession();
      const authenticated = Boolean(authData?.session?.user);

      if (error) {
        return {
          configured: true,
          connected: false,
          authenticated,
          hasContent: false,
          message: `Connected to Supabase, but query on 'content' returned: ${error.message}. (Did you run the setup SQL?)`,
        };
      }

      return {
        configured: true,
        connected: true,
        authenticated,
        hasContent: Boolean(data),
        message: data
          ? `Connected to Supabase. Published row found (last updated: ${new Date(data.updated_at).toLocaleString()}).`
          : "Connected to Supabase. 'content' table is ready, no published row yet (publish from Owner portal to create it).",
      };
    } catch (e: any) {
      return {
        configured: true,
        connected: false,
        authenticated: false,
        hasContent: false,
        message: `Network notice: ${e?.message || e}`,
      };
    }
  },
};
