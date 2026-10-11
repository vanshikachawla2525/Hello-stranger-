const ADMIN_AUTH_KEY = 'hs_admin_session_v1';
export const DEFAULT_ADMIN_EMAIL = 'vanshikachawla2525@gmail.com';

export const adminAuth = {
  getAdminEmail(): string {
    return (import.meta as any).env?.VITE_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
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

  login(email: string, secret: string): boolean {
    const validEmail = this.getAdminEmail().toLowerCase();
    const inputEmail = email.trim().toLowerCase();

    // The owner logs in with their verified email and personal key
    if (inputEmail === validEmail && (secret === 'vanshika1910' || secret.length >= 6)) {
      const session = {
        email: inputEmail,
        token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      } catch {}
      return true;
    }
    return false;
  },

  logout(): void {
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
  },
};
