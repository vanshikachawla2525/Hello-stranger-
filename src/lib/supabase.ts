import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteContent } from '../types/content';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

// Validate URL syntax before initializing
function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(isValidUrl(rawUrl) && rawAnonKey && rawAnonKey.length > 10);

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  getProjectUrl(): string {
    return rawUrl;
  },

  // Public read: fetch published document from 'content' table (id = 'published')
  async fetchPublishedContent(): Promise<SiteContent | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('content')
        .select('data')
        .eq('id', 'published')
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch error for published content:', error.message);
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
    note = 'Published update'
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase is not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)',
      };
    }

    try {
      const payload = {
        id: 'published',
        data: content,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('content')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase write error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Supabase write exception:', err);
      return { success: false, error: err?.message || 'Failed to publish to Supabase' };
    }
  },

  // Storage upload: uploads a photo file to the 'images' bucket and returns its public HTTPS URL (never base64)
  async uploadPhoto(
    file: File,
    slotId = 'photo'
  ): Promise<{ url: string | null; error?: string }> {
    if (!supabase) {
      return {
        url: null,
        error: 'Supabase storage is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.',
      };
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanSlot = slotId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniquePath = `uploads/${cleanSlot}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        return { url: null, error: error.message };
      }

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      if (!urlData?.publicUrl) {
        return { url: null, error: 'Could not generate public URL for uploaded photo.' };
      }

      return { url: urlData.publicUrl };
    } catch (err: any) {
      console.error('Supabase Storage upload exception:', err);
      return { url: null, error: err?.message || 'Storage upload failed' };
    }
  },

  // Storage upload: uploads ambient audio track to the 'images' bucket and returns public URL
  async uploadAudio(file: File): Promise<{ url: string | null; error?: string }> {
    if (!supabase) {
      return {
        url: null,
        error: 'Supabase storage is not configured.',
      };
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const uniquePath = `audio/ambient_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(uniquePath, file, {
          cacheControl: '86400',
          upsert: true,
          contentType: file.type || 'audio/mpeg',
        });

      if (error) {
        return { url: null, error: error.message };
      }

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      return { url: urlData?.publicUrl || null };
    } catch (err: any) {
      return { url: null, error: err?.message || 'Audio upload failed' };
    }
  },

  // Authenticate admin session with Supabase Auth so RLS allows authenticated writes
  async signInAdmin(
    email: string,
    passphrase: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      // First attempt sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passphrase,
      });

      if (!error && data?.session) {
        return { success: true };
      }

      // If user is not yet created in Supabase Auth, attempt sign-up
      if (
        error?.message?.toLowerCase().includes('invalid login credentials') ||
        error?.message?.toLowerCase().includes('user not found')
      ) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password: passphrase,
        });

        if (!signUpErr && signUpData?.session) {
          return { success: true };
        }
      }

      return { success: false, error: error?.message || 'Supabase authentication failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Supabase authentication failed' };
    }
  },

  async signOutAdmin(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
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
    if (!this.isConfigured() || !supabase) {
      return {
        configured: false,
        connected: false,
        authenticated: false,
        hasContent: false,
        message: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.',
      };
    }

    try {
      // Test read query
      const { data, error } = await supabase
        .from('content')
        .select('id, updated_at')
        .eq('id', 'published')
        .maybeSingle();

      const { data: authData } = await supabase.auth.getSession();
      const authenticated = Boolean(authData?.session?.user);

      if (error) {
        return {
          configured: true,
          connected: false,
          authenticated,
          hasContent: false,
          message: `Connected to Supabase, but query on 'content' returned: ${error.message}. (Did you run the schema SQL?)`,
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
        message: `Network error connecting to Supabase: ${e?.message || e}`,
      };
    }
  },
};
