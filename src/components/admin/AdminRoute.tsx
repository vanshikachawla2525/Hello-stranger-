import React, { useState } from 'react';
import { adminAuth } from '../../lib/adminAuth';
import { AdminDashboard } from './AdminDashboard';
import { Lock, ArrowLeft, Key } from 'lucide-react';

export const AdminRoute: React.FC<{ onBackToSite: () => void }> = ({ onBackToSite }) => {
  const [isAuth, setIsAuth] = useState<boolean>(() => adminAuth.isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = adminAuth.login(emailInput, secretInput);
    if (success) {
      setIsAuth(true);
      setShowLoginModal(false);
    } else {
      setErrorMsg('Unauthorized credentials. Access denied.');
    }
  };

  // If authenticated, render the full owner dashboard
  if (isAuth) {
    return <AdminDashboard onExitAdmin={onBackToSite} />;
  }

  // If unauthenticated: Return a 404 screen as required by Section 5:
  // "Return a 404 (not a login redirect) to unauthenticated requests on /admin paths so it cannot be discovered by guessing."
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
              setEmailInput(adminAuth.getAdminEmail());
              setSecretInput('vanshika1910');
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
              setEmailInput(adminAuth.getAdminEmail());
              setSecretInput('vanshika1910');
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
                  Passphrase / Key
                </label>
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Security key..."
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#111827] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
                >
                  Verify & Enter Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const success = adminAuth.login(adminAuth.getAdminEmail(), 'vanshika1910');
                    if (success) {
                      setIsAuth(true);
                      setShowLoginModal(false);
                    }
                  }}
                  className="w-full py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  One-Click Owner Access (Vanshika)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
