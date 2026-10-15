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
    const validEmail = this.getAdminEmail().toLowerCase().trim();
    const validPassphrase = this.getAdminPassphrase().trim();
    const inputEmail = (email || '').trim().toLowerCase();
    const inputSecret = (secret || '').trim();

    // Credentials must be defined via build-time env vars (no fallback defaults in code).
    if (!validEmail || !validPassphrase) {
      return false;
    }

    if (inputEmail === validEmail && inputSecret === validPassphrase) {
      const session = {
        email: inputEmail,
        token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      } catch {}

      // Attempt Supabase sign-in if configured, but never block local login
      if (supabaseService.isConfigured()) {
        try {
          await supabaseService.signInAdmin(inputEmail, inputSecret);
        } catch (_) {}
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
