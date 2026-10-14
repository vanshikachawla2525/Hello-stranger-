import { supabaseService } from './supabase';

const ADMIN_AUTH_KEY = 'hs_admin_session_v1';

export const adminAuth = {
  getAdminEmail(): string {
    return import.meta.env.VITE_ADMIN_EMAIL?.trim() || '';
  },

  getAdminPassphrase(): string {
    return import.meta.env.VITE_ADMIN_PASSPHRASE || '';
  },

  isAuthenticated(): boolean {
    try {
      const session = localStorage.getItem(ADMIN_AUTH_KEY);
      if (!session) return false;
      const parsed = JSON.parse(session);
      return Boolean(parsed.email && parsed.token && Date.now() < parsed.expiresAt);
    } catch {
      return false;
    }
  },

  async login(email: string, secret: string): Promise<boolean> {
    const validEmail = this.getAdminEmail().toLowerCase();
    const validPassphrase = this.getAdminPassphrase();
    const inputEmail = email.trim().toLowerCase();

    // No hardcoded secret or length bypass.
    // Credentials must be defined via build-time env vars (no fallback defaults in code).
    if (!validEmail || !validPassphrase) {
      return false;
    }

    if (inputEmail === validEmail && secret === validPassphrase) {
      const session = {
        email: inputEmail,
        token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      } catch {}

      // Authenticate with Supabase so Row-Level Security allows admin writes to 'content' and 'images' bucket
      if (supabaseService.isConfigured()) {
        try {
          await supabaseService.signInAdmin(inputEmail, secret);
        } catch (e) {
          console.warn('Supabase auth sign-in warning:', e);
        }
      }

      return true;
    }
    return false;
  },

  logout(): void {
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
    if (supabaseService.isConfigured()) {
      supabaseService.signOutAdmin().catch(() => {});
    }
  },
};
