import React, { Component, ErrorInfo, ReactNode } from 'react';

interface AdminErrorBoundaryProps {
  children: ReactNode;
  onExitAdmin?: () => void;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Error Boundary caught an error:', error, errorInfo);
  }

  handleClearDraft = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hs_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EFE8DA] text-[#1B1713] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 text-left space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B3342B]" />
              <h2 className="text-base font-bold text-gray-900">
                Something went wrong in the admin panel
              </h2>
            </div>
            <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded border border-gray-200 break-words max-h-36 overflow-y-auto">
              {this.state.error?.message || 'Unknown runtime error occurred.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
              >
                Reload
              </button>
              <button
                onClick={this.handleClearDraft}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                title="Clears draft and preview cache without affecting published live content"
              >
                Clear local draft
              </button>
              {this.props.onExitAdmin && (
                <button
                  onClick={this.props.onExitAdmin}
                  className="w-full sm:w-auto px-4 py-2 text-gray-500 text-xs hover:text-gray-900 transition-colors ml-auto"
                >
                  Return to site
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Root Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('hs_content_published_v1');
      localStorage.removeItem('hs_content_draft');
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1B1713] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md space-y-4">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#7A7064] block">
              notice
            </span>
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#1B1713]">
              hello, stranger.
            </h1>
            <p className="text-xs text-[#7A7064] leading-relaxed">
              we encountered a small loading snag displaying this memory archive.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-full bg-[#1B1713] text-[#FAF7F2] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                refresh page
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2 rounded-full border border-[#1B1713]/20 text-[#1B1713] text-xs font-medium hover:bg-[#1B1713]/5 transition-colors"
              >
                reset cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
