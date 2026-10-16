import React, { useState, useEffect } from 'react';
import { adminAuth } from '../../lib/adminAuth';
import { AdminDashboard } from './AdminDashboard';
import { AdminErrorBoundary } from '../common/ErrorBoundary';
import { Lock } from 'lucide-react';

export const AdminRoute: React.FC<{ onBackToSite: () => void }> = ({ onBackToSite }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check active Supabase session on mount
    adminAuth.getSession().then((session) => {
      if (isMounted) {
        setIsAuth(Boolean(session));
        setIsCheckingSession(false);
      }
    });

    // Listen for auth state changes
    const subscription = adminAuth.onAuthStateChange((authenticated) => {
      if (isMounted) {
        setIsAuth(authenticated);
        setIsCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      const result = await adminAuth.login(emailInput, secretInput);
      if (result.ok) {
        setIsAuth(true);
        setShowLoginModal(false);
        setEmailInput('');
        setSecretInput('');
      } else {
        setErrorMsg(result.message);
      }
    } catch {
      setErrorMsg('Login attempt failed. Please check your network and credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Minimal loading state while checking real Supabase session on mount
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#EFE8DA] text-[#7A7064] flex items-center justify-center font-mono text-xs select-none">
        checking session…
      </div>
    );
  }

  // If authenticated, render the full owner dashboard wrapped in AdminErrorBoundary
  if (isAuth) {
    return (
      <AdminErrorBoundary onExitAdmin={onBackToSite}>
        <AdminDashboard onExitAdmin={onBackToSite} />
      </AdminErrorBoundary>
    );
  }

  // If unauthenticated: Return 404 stealth screen
  return (
    <div className="min-h-screen bg-[#EFE8DA] text-[#1B1713] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="max-w-md space-y-6">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#7A7064] block">
          404 · error
        </span>
        <h1 className="font-serif italic text-4xl sm:text-5xl text-[#1B1713]">
          this page wasn't saved.
        </h1>
        <p className="text-xs font-mono text-[#7A7064]">
          the link you followed may be private or does not exist.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBackToSite}
            className="px-6 py-2.5 rounded-full bg-[#1B1713] text-[#EFE8DA] text-xs font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            go back to the beginning.
          </button>
          <button
            onClick={() => {
              setErrorMsg('');
              setShowLoginModal(true);
            }}
            className="px-5 py-2.5 rounded-full border border-[#1B1713]/20 text-[#1B1713] text-xs font-medium tracking-wide hover:bg-[#1B1713]/5 transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#B3342B]" />
            <span>owner unlock</span>
          </button>
        </div>

        {/* Discrete Owner Unlock Trigger (seam dot) */}
        <div className="pt-12">
          <button
            onClick={() => {
              setErrorMsg('');
              setShowLoginModal(true);
            }}
            className="w-2.5 h-2.5 rounded-full bg-[#B3342B]/30 hover:bg-[#B3342B] transition-colors cursor-pointer"
            title="Owner gateway"
            aria-label="Owner gateway"
          />
        </div>
      </div>

      {/* Owner Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-left space-y-4 shadow-2xl text-[#111827]">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#B3342B]" />
                <h3 className="text-sm font-bold">Owner Access Verification</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Diagnostic status line inside modal (never prints key values) */}
            <div className="text-[10px] font-mono text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between">
              <span>Supabase: {adminAuth.isSupabaseConfigured() ? 'configured ✓' : 'not configured ✗'}</span>
              <span>Admin email: {adminAuth.getAdminEmail() ? 'set ✓' : 'not set ✗'}</span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Owner Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Owner email..."
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Supabase user password..."
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2 bg-[#111827] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingIn ? 'Verifying with Supabase...' : 'Verify & Enter Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
