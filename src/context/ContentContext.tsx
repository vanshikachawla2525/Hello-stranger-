import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent, Photo } from '../types/content';
import { storage } from '../lib/storage';
import { content as canonicalSeed } from '../content/content';

type ContentContextType = {
  content: SiteContent;
  updateContent: (updater: (prev: SiteContent) => SiteContent) => void;
  updatePhoto: (photoId: string, updates: Partial<Photo>) => void;
  updateText: (path: string, value: any) => void;
  resetContent: () => void;
  exportContent: () => void;
  importContent: (jsonStr: string) => boolean;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  marginaliaEnabled: boolean;
  setMarginaliaEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (enabled: boolean) => void;
  reloadContent: () => void;
  applyPublishedContent: (newContent: SiteContent) => void;
};

const ContentContext = createContext<ContentContextType | null>(null);

const SOUND_KEY = 'vanshika_sound_enabled';
const MARGINALIA_KEY = 'vanshika_marginalia_enabled';

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(() => storage.isPreviewMode());

  const [content, setContent] = useState<SiteContent>(() => {
    try {
      if (storage.isPreviewMode()) {
        return storage.getDraft();
      }
      return storage.getPublished();
    } catch {
      return canonicalSeed as SiteContent;
    }
  });

  const reloadContent = React.useCallback(() => {
    try {
      const preview = storage.isPreviewMode();
      setIsPreviewMode(preview);
      const data = preview ? storage.getDraft() : storage.getPublished();
      setContent(data);
    } catch {
      setContent(canonicalSeed as SiteContent);
    }
  }, []);

  const applyPublishedContent = React.useCallback((newContent: SiteContent) => {
    setContent(JSON.parse(JSON.stringify(newContent)));
  }, []);

  // Sync content with storage events and custom pub/sub events
  useEffect(() => {
    const handleSync = () => {
      reloadContent();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('hs_content_published', handleSync);
    window.addEventListener('hs_content_updated', handleSync);
    window.addEventListener('hs_preview_mode_changed', handleSync);
    window.addEventListener('hs_draft_saved', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('hs_content_published', handleSync);
      window.removeEventListener('hs_content_updated', handleSync);
      window.removeEventListener('hs_preview_mode_changed', handleSync);
      window.removeEventListener('hs_draft_saved', handleSync);
    };
  }, [reloadContent]);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [marginaliaEnabled, setMarginaliaEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(MARGINALIA_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [activeTheme, setActiveTheme] = useState('hero');
  const [activeSection, setActiveSection] = useState('page-0');

  // Sync theme with HTML root data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Sync favicon with theme color
  useEffect(() => {
    const faviconMap: Record<string, string> = {
      hero: '%23B3342B',
      scrap: '%23C8322B',
      drafts: '%236B5444',
      archive: '%23D49A5A',
      beas: '%23C9A45C',
      orbit: '%23C9A45C',
      sage: '%23F0CF65',
      proud: '%236E1F2A',
      observatory: '%232F6BFF',
      terracotta: '%23D9A19A',
      sky: '%23F08A3C',
      letters: '%237A2230',
      rest: '%232A2622',
    };
    const color = faviconMap[activeTheme] || '%23B3342B';
    const link = document.getElementById('favicon-link') as HTMLLinkElement;
    if (link) {
      link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='${color}'/></svg>`;
    }
  }, [activeTheme]);

  // Tab blur title effect (delight detail: "come back, stranger.")
  useEffect(() => {
    const originalTitle = document.title;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = 'come back, stranger.';
      } else {
        document.title = originalTitle;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(MARGINALIA_KEY, String(marginaliaEnabled));
    } catch {}
  }, [marginaliaEnabled]);

  const updateContent = (updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => updater(prev));
  };

  const updatePhoto = (photoId: string, updates: Partial<Photo>) => {
    setContent((prev) => {
      const copy: SiteContent = JSON.parse(JSON.stringify(prev));

      const checkAndUpdate = (p: Photo | undefined): boolean => {
        if (!p) return false;
        if (p.id === photoId) {
          Object.assign(p, updates);
          return true;
        }
        return false;
      };

      checkAndUpdate(copy.hero.panorama);
      checkAndUpdate(copy.hero.portrait);
      checkAndUpdate(copy.hero.portraitSecondary);

      copy.noBigDeal.polaroids.forEach((item) => {
        checkAndUpdate(item.photo);
      });

      copy.drafts.entries.forEach((item) => {
        if (item.photo) checkAndUpdate(item.photo);
      });

      copy.childhood.photos.forEach((item) => {
        checkAndUpdate(item.photo);
      });

      if (copy.interludeBeas.photo) checkAndUpdate(copy.interludeBeas.photo);

      copy.people.forEach((item) => {
        checkAndUpdate(item.photo);
      });

      copy.lucky.forEach((item) => {
        if (item.photo) checkAndUpdate(item.photo);
      });

      copy.proud.forEach((item) => {
        checkAndUpdate(item.photo);
      });

      checkAndUpdate(copy.notYet.photo);

      copy.dreams.forEach((item) => {
        checkAndUpdate(item.photo);
      });

      checkAndUpdate(copy.finale.photo);

      return copy;
    });
  };

  const updateText = (path: string, value: any) => {
    setContent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let curr = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const resetContent = () => {
    try {
      localStorage.removeItem('content_published');
      localStorage.removeItem('content_draft');
    } catch {}
    setContent(canonicalSeed as SiteContent);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hs_content_updated'));
    }
  };

  const exportContent = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vanshika_chawla_content_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importContent = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.identity && parsed.hero) {
        setContent(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        updateContent,
        updatePhoto,
        updateText,
        resetContent,
        exportContent,
        importContent,
        isAdminOpen,
        setIsAdminOpen,
        soundEnabled,
        setSoundEnabled,
        marginaliaEnabled,
        setMarginaliaEnabled,
        activeTheme,
        setActiveTheme,
        activeSection,
        setActiveSection,
        isPreviewMode,
        setIsPreviewMode,
        reloadContent,
        applyPublishedContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};
