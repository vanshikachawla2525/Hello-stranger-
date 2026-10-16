/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ContentProvider, useContent } from './context/ContentContext';
import { storage } from './lib/storage';
import { Loader } from './components/common/Loader';
import { TopBar } from './components/common/TopBar';
import { LeftRail } from './components/common/LeftRail';
import { Seam } from './components/common/Seam';
import { ExplorePill } from './components/common/ExplorePill';
import { RandomPill } from './components/common/RandomPill';
import { AdminRoute } from './components/admin/AdminRoute';
import { RootErrorBoundary } from './components/common/ErrorBoundary';

import { Page0Hero } from './components/sections/Page0Hero';
import { Page1NoBigDeal } from './components/sections/Page1NoBigDeal';
import { Page2FromTheDrafts } from './components/sections/Page2FromTheDrafts';
import { Page3BeforeIKnew } from './components/sections/Page3BeforeIKnew';
import { InterludeBeas } from './components/sections/InterludeBeas';
import { Page4PeopleICarry } from './components/sections/Page4PeopleICarry';
import { Page5LuckyActually } from './components/sections/Page5LuckyActually';
import { Page6LookHowFar } from './components/sections/Page6LookHowFar';
import { Page7IWonder } from './components/sections/Page7IWonder';
import { Page8NotYet } from './components/sections/Page8NotYet';
import { Page9OneDay } from './components/sections/Page9OneDay';
import { Page10ToWhoeverIBecome } from './components/sections/Page10ToWhoeverIBecome';
import { Page11StillBecoming } from './components/sections/Page11StillBecoming';

const isAdminPath = (p: string) => /^\/admin\/?$/i.test(p);

const MainApp: React.FC = () => {
  const [loaderDone, setLoaderDone] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const { content, setActiveTheme, isPreviewMode, reloadContent } = useContent();

  // Normalize path: /admin/, /Admin -> silently replaceState to /admin
  useEffect(() => {
    if (isAdminPath(window.location.pathname) && window.location.pathname !== '/admin') {
      window.history.replaceState(null, '', '/admin' + window.location.search);
      setCurrentPath('/admin');
    }
  }, [currentPath]);

  // Manage <meta name="robots" content="noindex"> only when path is /admin
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (isAdminPath(currentPath)) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'robots';
        document.head.appendChild(meta);
      }
      meta.content = 'noindex';
    } else if (meta) {
      meta.remove();
    }
  }, [currentPath]);

  // Listen for preview query parameter in new tab / iframe
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('preview=true')) {
      storage.setPreviewMode(true);
      reloadContent();
    }
  }, [reloadContent]);

  // Listen for browser popstate or path changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      reloadContent();
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [reloadContent]);

  // Delight detail from Section 2.10: console message
  useEffect(() => {
    console.log("hello, stranger. you looked.");
  }, []);

  // Keyboard shortcut for owner: Ctrl+Shift+A opens /admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.history.pushState(null, '', '/admin');
        setCurrentPath('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll listener to update progress & dynamic themes
  useEffect(() => {
    if (isAdminPath(currentPath)) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const pct = (window.scrollY / totalHeight) * 100;
        setScrollPercentage(Math.min(100, Math.max(0, pct)));
      }

      // Check current section in viewport to sync theme
      const sections = [
        { id: 'page-0', theme: 'hero' },
        { id: 'page-1', theme: 'scrap' },
        { id: 'page-2', theme: 'drafts' },
        { id: 'page-3', theme: 'archive' },
        ...(!content.interludeBeas?.hidden ? [{ id: 'page-beas', theme: 'beas' }] : []),
        { id: 'page-4', theme: 'orbit' },
        { id: 'page-5', theme: 'sage' },
        { id: 'page-6', theme: 'proud' },
        { id: 'page-7', theme: 'observatory' },
        { id: 'page-8', theme: 'terracotta' },
        { id: 'page-9', theme: 'sky' },
        { id: 'page-10', theme: 'letters' },
        { id: 'page-11', theme: 'rest' },
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveTheme(sections[i].theme);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath, setActiveTheme, content.interludeBeas?.hidden]);

  // If URL path is /admin, render owner AdminRoute (which conceals behind 404 unless authenticated)
  if (isAdminPath(currentPath)) {
    return (
      <AdminRoute
        onBackToSite={() => {
          window.history.pushState(null, '', '/');
          setCurrentPath('/');
          reloadContent();
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--accent2)] selection:text-[var(--ink)] overflow-x-hidden">
      
      {/* Discrete Draft Preview Banner (Only appears in owner preview mode) */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-black text-xs py-1.5 px-4 font-mono font-bold tracking-wider sticky top-0 z-50 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>[DRAFT PREVIEW MODE] Rendering in-progress draft content</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.history.pushState(null, '', '/admin');
                setCurrentPath('/admin');
              }}
              className="underline hover:opacity-80 cursor-pointer font-bold"
            >
              return to admin portal
            </button>
            <button
              onClick={() => {
                storage.setPreviewMode(false);
                reloadContent();
              }}
              className="px-2.5 py-0.5 bg-black text-amber-400 text-[11px] rounded hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              exit preview mode
            </button>
          </div>
        </div>
      )}

      {/* 1. Story-driven Loader */}
      <Loader onComplete={() => setLoaderDone(true)} />

      {/* 2. Top Navigation Bar */}
      <TopBar onOpenExplore={() => setIsExploreOpen(true)} />

      {/* 3. Left Rail with Scroll Progress, Sound & Notes Controls */}
      <LeftRail
        scrollPercentage={scrollPercentage}
        onOpenExplore={() => setIsExploreOpen(true)}
      />

      {/* 4. The 1px Seam Vertical Motif Line */}
      <Seam scrollPercentage={scrollPercentage} />

      {/* 5. Memory Chapters in Sequence */}
      <main className="w-full relative">
        <Page0Hero />
        <Page1NoBigDeal />
        <Page2FromTheDrafts />
        <Page3BeforeIKnew />
        {!content.interludeBeas?.hidden && <InterludeBeas />}
        <Page4PeopleICarry />
        <Page5LuckyActually />
        <Page6LookHowFar />
        <Page7IWonder />
        <Page8NotYet />
        <Page9OneDay />
        <Page10ToWhoeverIBecome />
        <Page11StillBecoming />
      </main>

      {/* 6. Floating Navigation Pills */}
      <ExplorePill
        isOpen={isExploreOpen}
        onOpen={() => setIsExploreOpen(true)}
        onClose={() => setIsExploreOpen(false)}
      />
      <RandomPill />
    </div>
  );
};

export default function App() {
  return (
    <RootErrorBoundary>
      <ContentProvider>
        <MainApp />
      </ContentProvider>
    </RootErrorBoundary>
  );
}
