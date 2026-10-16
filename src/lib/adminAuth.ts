import { supabaseService } from './supabase';

export type AuthErrorCode =
  | 'SUPABASE_NOT_CONFIGURED'
  | 'ADMIN_EMAIL_NOT_SET'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'NOT_ADMIN'
  | 'NETWORK'
  | 'UNKNOWN';

export type AuthResult =
  | { ok: true }
  | { ok: false; code: AuthErrorCode; message: string };

export const adminAuth = {
  getAdminEmail(): string {
    return (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
  },

  isSupabaseConfigured(): boolean {
    return supabaseService.isConfigured();
  },

  async getSession() {
    if (!supabaseService.isConfigured()) return null;
    const client = supabaseService.getClient();
    if (!client) return null;
    try {
      const { data } = await client.auth.getSession();
      const userEmail = (data.session?.user?.email || '').toLowerCase().trim();
      const adminEmail = this.getAdminEmail();
      if (userEmail && adminEmail && userEmail === adminEmail) {
        return data.session;
      }
      return null;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (isAuthenticated: boolean) => void) {
    const client = supabaseService.getClient();
    if (!client) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      const userEmail = (session?.user?.email || '').toLowerCase().trim();
      const adminEmail = this.getAdminEmail();
      const isOwner = Boolean(userEmail && adminEmail && userEmail === adminEmail);
      callback(isOwner);
    });
    return subscription;
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      return {
        ok: false,
        code: 'ADMIN_EMAIL_NOT_SET',
        message: "VITE_ADMIN_EMAIL isn't set. Add it in Vercel and Redeploy.",
      };
    }

    if (!supabaseService.isConfigured()) {
      return {
        ok: false,
        code: 'SUPABASE_NOT_CONFIGURED',
        message: "Supabase isn't configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then Redeploy.",
      };
    }

    const client = supabaseService.getClient();
    if (!client) {
      return {
        ok: false,
        code: 'SUPABASE_NOT_CONFIGURED',
        message: "Supabase isn't configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then Redeploy.",
      };
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        const msg = error.message || '';
        const lower = msg.toLowerCase();
        if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
          return {
            ok: false,
            code: 'INVALID_CREDENTIALS',
            message: 'Wrong email or password.',
          };
        }
        if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
          return {
            ok: false,
            code: 'EMAIL_NOT_CONFIRMED',
            message: "This Supabase user isn't confirmed. In Supabase → Authentication → Users, confirm the user (or delete and re-create it with 'Auto Confirm User' ticked).",
          };
        }
        if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('fetch')) {
          return {
            ok: false,
            code: 'NETWORK',
            message: "Couldn't reach Supabase. Check VITE_SUPABASE_URL.",
          };
        }
        return {
          ok: false,
          code: 'UNKNOWN',
          message: msg || 'An unexpected error occurred during sign-in.',
        };
      }

      if (!data?.session?.user) {
        return {
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Wrong email or password.',
        };
      }

      const userEmail = (data.session.user.email || '').toLowerCase().trim();
      if (userEmail !== adminEmail) {
        await client.auth.signOut();
        return {
          ok: false,
          code: 'NOT_ADMIN',
          message: "This account isn't the site owner.",
        };
      }

      return { ok: true };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        return {
          ok: false,
          code: 'NETWORK',
          message: "Couldn't reach Supabase. Check VITE_SUPABASE_URL.",
        };
      }
      return {
        ok: false,
        code: 'UNKNOWN',
        message: msg || 'An unexpected error occurred during sign-in.',
      };
    }
  },

  async logout(): Promise<void> {
    const client = supabaseService.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {}
    }
  },
};
