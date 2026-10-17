import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { adminAuth } from '../../lib/adminAuth';
import { Sliders, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const TopBar: React.FC<{ onOpenExplore: () => void }> = ({ onOpenExplore }) => {
  const { content, activeTheme } = useContent();

  const isDark = ['beas', 'orbit', 'proud', 'observatory', 'letters'].includes(activeTheme);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg)]/85 border-b border-[var(--line)] transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <a
          href="#page-0"
          className="font-serif text-xl sm:text-2xl tracking-tight text-[var(--ink)] hover:opacity-80 transition-opacity"
        >
          {content.identity.name}
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wider uppercase text-[var(--muted)]">
          <a href="#page-0" className="hover:text-[var(--ink)] transition-colors">
            hello
          </a>
          <a href="#page-1" className="hover:text-[var(--ink)] transition-colors">
            scrapbook
          </a>
          <a href="#page-2" className="hover:text-[var(--ink)] transition-colors">
            drafts
          </a>
          <a href="#page-3" className="hover:text-[var(--ink)] transition-colors">
            archive
          </a>
          <a href="#page-4" className="hover:text-[var(--ink)] transition-colors">
            people
          </a>
          <a href="#page-10" className="hover:text-[var(--ink)] transition-colors">
            letters
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenExplore}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--line)] rounded-full hover:border-[var(--ink)] transition-colors text-[var(--ink)]"
          >
            <span>Chapters</span>
          </button>

          <button
            onClick={() => {
              window.history.pushState(null, '', '/admin');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap cursor-pointer"
            title="Open real-time editor to modify photos, captions, and text"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Admin Studio</span>
          </button>
        </div>

      </div>
    </header>
  );
};
