import React from 'react';
import { useContent } from '../../context/ContentContext';
import { Menu, Sparkles, Volume2, VolumeX } from 'lucide-react';

export const LeftRail: React.FC<{
  scrollPercentage: number;
  onOpenExplore: () => void;
}> = ({ scrollPercentage, onOpenExplore }) => {
  const { soundEnabled, setSoundEnabled, marginaliaEnabled, setMarginaliaEnabled, activeTheme } = useContent();

  const isHidden = activeTheme === 'beas';

  if (isHidden) return null;

  return (
    <>
      {/* Desktop Left Rail */}
      <aside className="fixed left-0 top-16 bottom-0 w-14 z-30 hidden lg:flex flex-col items-center justify-between py-8 border-r border-[var(--line)] bg-[var(--bg)]/30 backdrop-blur-[2px] transition-colors duration-700 pointer-events-auto">
        
        {/* Top: Hamburger / Explore trigger */}
        <button
          onClick={onOpenExplore}
          className="w-8 h-8 rounded flex items-center justify-center text-[var(--ink)] hover:bg-[var(--line)] transition-colors group"
          title="Open Explore Menu"
          aria-label="Open Explore Menu"
        >
          <Menu className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Center: Vertical scroll line and percentage indicator */}
        <div className="flex-1 flex flex-col items-center justify-center my-6 relative w-full">
          <div className="text-[10px] font-mono tracking-tighter text-[var(--muted)] -rotate-90 origin-center mb-6 whitespace-nowrap">
            {Math.round(scrollPercentage)}%
          </div>

          <div className="w-[1px] h-32 bg-[var(--line)] relative overflow-hidden rounded-full">
            <div
              className="w-full bg-[var(--ink)] transition-all duration-150 origin-top"
              style={{ height: `${scrollPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom: Rotating 4-point star, sound & notes toggles */}
        <div className="flex flex-col items-center gap-4 text-[9px] font-mono tracking-wider text-[var(--muted)]">
          
          <button
            onClick={() => setMarginaliaEnabled((prev) => !prev)}
            className="hover:text-[var(--ink)] transition-colors -rotate-90 origin-center my-2 whitespace-nowrap"
            title="Toggle Developer Marginalia Annotations"
          >
            notes: {marginaliaEnabled ? 'on' : 'off'}
          </button>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="hover:text-[var(--ink)] transition-colors -rotate-90 origin-center my-2 whitespace-nowrap"
            title="Toggle Ambient Audio"
          >
            sound: {soundEnabled ? 'on' : 'off'}
          </button>

          <div className="pt-2">
            <svg
              className="w-3.5 h-3.5 text-[var(--ink)] animate-[spin_18s_linear_infinite]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

        </div>

      </aside>

      {/* Mobile Floating Sound / Equalizer Button (Bottom-Right seen in mobile video) */}
      <div className="fixed bottom-6 right-5 z-40 lg:hidden flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 ${
            soundEnabled
              ? 'bg-[#1B1713] text-white ring-2 ring-[var(--accent)]'
              : 'bg-[#1B1713]/85 text-[#EFE8DA]'
          }`}
          title="Toggle Ambient Sound"
          aria-label="Sound Toggle"
        >
          {soundEnabled ? (
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-0.5 bg-white h-3 animate-pulse" />
              <span className="w-0.5 bg-white h-4 animate-bounce" />
              <span className="w-0.5 bg-white h-2 animate-pulse" />
            </div>
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
};
