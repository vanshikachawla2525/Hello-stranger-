import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { X } from 'lucide-react';

const CHAPTERS = [
  { id: 'page-0', name: 'hello, stranger.', theme: 'hero', color: '#B3342B', bg: '#EFE8DA' },
  { id: 'page-1', name: 'no big deal.', theme: 'scrap', color: '#C8322B', bg: '#F4EBD6' },
  { id: 'page-2', name: 'from the drafts.', theme: 'drafts', color: '#6B5444', bg: '#F6F0E4' },
  { id: 'page-3', name: 'before i knew.', theme: 'archive', color: '#D49A5A', bg: '#F3E6D0' },
  { id: 'page-beas', name: 'the silence (beas).', theme: 'beas', color: '#C9A45C', bg: '#0E1A33' },
  { id: 'page-4', name: 'people i carry.', theme: 'orbit', color: '#C9A45C', bg: '#0E1A33' },
  { id: 'page-5', name: 'lucky, actually.', theme: 'sage', color: '#F0CF65', bg: '#A9B89A' },
  { id: 'page-6', name: 'look how far.', theme: 'proud', color: '#6E1F2A', bg: '#0D0C0C' },
  { id: 'page-7', name: 'i wonder.', theme: 'observatory', color: '#2F6BFF', bg: '#060C24' },
  { id: 'page-8', name: 'not yet.', theme: 'terracotta', color: '#D9A19A', bg: '#C0643F' },
  { id: 'page-9', name: 'one day.', theme: 'sky', color: '#F08A3C', bg: '#8FC4E8' },
  { id: 'page-10', name: 'to whoever i become.', theme: 'letters', color: '#7A2230', bg: '#2A1812' },
  { id: 'page-11', name: 'still becoming.', theme: 'rest', color: '#2A2622', bg: '#F7F2E9' },
];

export const ExplorePill: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}> = ({ isOpen, onClose, onOpen }) => {
  const { content, setActiveTheme } = useContent();
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);

  const chapters = React.useMemo(() => {
    return CHAPTERS.filter((ch) => ch.id !== 'page-beas' || !content.interludeBeas?.hidden);
  }, [content.interludeBeas?.hidden]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectChapter = (ch: typeof CHAPTERS[0]) => {
    setActiveTheme(ch.theme);
    const el = document.getElementById(ch.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  return (
    <>
      {/* Floating Pill Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={onOpen}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--ink)] bg-[var(--bg)] text-[var(--ink)] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95 text-xs font-medium tracking-wider"
        >
          <span className="text-[var(--accent)] text-sm transition-transform group-hover:rotate-45">✦</span>
          <span>explore</span>
        </button>
      </div>

      {/* Full-Height Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-h-[92vh] overflow-y-auto bg-[#EFE8DA] text-[#1B1713] rounded-t-3xl shadow-2xl border-t border-[#1B1713]/10 p-6 sm:p-12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] animate-slideUp"
            style={{
              backgroundColor: hoveredChapter
                ? CHAPTERS.find((c) => c.id === hoveredChapter)?.bg || '#EFE8DA'
                : '#EFE8DA',
              color: hoveredChapter && ['page-beas', 'page-4', 'page-6', 'page-7', 'page-10'].includes(hoveredChapter)
                ? '#F2EAD8'
                : '#1B1713',
            }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-8 border-b border-current/15 max-w-4xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest opacity-60">
                archive index · 12 chapters
              </span>
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-xs uppercase tracking-widest font-mono opacity-80 hover:opacity-100 transition-opacity"
              >
                <span>put it back [esc]</span>
                <X className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Chapters List */}
            <div className="max-w-4xl mx-auto py-8 space-y-4">
              {chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  onMouseEnter={() => setHoveredChapter(ch.id)}
                  onMouseLeave={() => setHoveredChapter(null)}
                  onClick={() => handleSelectChapter(ch)}
                  className="group relative flex items-center justify-between py-3 cursor-pointer transition-all duration-200 border-b border-current/5"
                >
                  <div className="flex items-center gap-4 sm:gap-8">
                    {/* Color bar preview */}
                    <div
                      className="w-1.5 h-8 rounded-full transition-all duration-300 group-hover:scale-y-125"
                      style={{ backgroundColor: ch.color }}
                    />
                    <span className="text-xs font-mono opacity-50 tracking-wider">
                      {String(idx).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-4xl italic transition-transform duration-300 group-hover:translate-x-3">
                      {ch.name}
                    </h3>
                  </div>

                  <span className="text-xs font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    read →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
