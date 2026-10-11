import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';

const SWATCHES = [
  { id: 'page-0', name: '0. hello, stranger.', theme: 'hero', color: '#B3342B' },
  { id: 'page-1', name: '1. no big deal.', theme: 'scrap', color: '#C8322B' },
  { id: 'page-2', name: '2. from the drafts.', theme: 'drafts', color: '#6B5444' },
  { id: 'page-3', name: '3. before i knew.', theme: 'archive', color: '#D49A5A' },
  { id: 'page-beas', name: 'A. the silence (beas).', theme: 'beas', color: '#C9A45C' },
  { id: 'page-4', name: '4. people i carry.', theme: 'orbit', color: '#BFD6FF' },
  { id: 'page-5', name: '5. lucky, actually.', theme: 'sage', color: '#F0CF65' },
  { id: 'page-6', name: '6. look how far.', theme: 'proud', color: '#6E1F2A' },
  { id: 'page-7', name: '7. i wonder.', theme: 'observatory', color: '#2F6BFF' },
  { id: 'page-8', name: '8. not yet.', theme: 'terracotta', color: '#C0643F' },
  { id: 'page-9', name: '9. one day.', theme: 'sky', color: '#F08A3C' },
  { id: 'page-10', name: '10. to whoever i become.', theme: 'letters', color: '#7A2230' },
  { id: 'page-11', name: '11. still becoming.', theme: 'rest', color: '#2A2622' },
];

export const Page11StillBecoming: React.FC = () => {
  const { content, setActiveTheme } = useContent();
  const { finale, identity } = content;
  const [hoveredSwatch, setHoveredSwatch] = useState<string | null>(null);

  const swatches = React.useMemo(() => {
    return SWATCHES.filter((sw) => sw.id !== 'page-beas' || !content.interludeBeas?.hidden);
  }, [content.interludeBeas?.hidden]);

  const handleSwatchClick = (sw: typeof SWATCHES[0]) => {
    setActiveTheme(sw.theme);
    const el = document.getElementById(sw.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="page-11"
      className="relative min-h-screen w-full py-28 px-4 sm:px-8 lg:px-16 bg-[#F7F2E9] text-[#2A2622] overflow-hidden transition-colors duration-700 flex flex-col justify-between"
    >
      {/* Header & Photo Layout */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Editorial Typography & Four Words Payoff */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#8B8379] block">
              page 11 · finale
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl italic tracking-tight text-[#2A2622]">
              {finale.heading}
            </h2>
            <p className="font-serif text-lg sm:text-2xl text-[#8B8379] italic pt-2">
              "{finale.text}"
            </p>
          </div>

          {/* THE PAYOFF: The Four Words Return with Their Deeper Meanings */}
          <div className="pt-6 border-t border-[#2A2622]/15 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B8379] block">
              The Four Touchstones · In Perspective
            </span>

            <div className="space-y-3">
              {identity.fourWords.map((fw) => (
                <div key={fw.word} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="font-serif italic font-bold text-xl sm:text-2xl text-[#2A2622] w-24 shrink-0">
                    {fw.word}.
                  </span>
                  <span className="font-sans text-xs sm:text-sm text-[#7A7064]">
                    — {fw.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Site Date & Vanshika Signature */}
          <div className="pt-8 border-t border-[#2A2622]/15 flex items-center justify-between">
            <div>
              <p className="font-serif text-2xl font-bold text-[#2A2622]">
                {identity.name}
              </p>
              <span className="text-xs font-mono text-[#8B8379]">
                {identity.siteDate}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8B8379]">
                curated memory archive
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Finale Quiet Portrait */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden border border-[#2A2622]/15 shadow-2xl bg-[#E8E0D2] aspect-[3/4]">
            <img
              src={finale.photo.file}
              alt={finale.photo.alt}
              className="w-full h-full object-cover"
            />
            {finale.photo.caption && (
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-xs rounded-xl text-xs font-mono text-[#2A2622]">
                {finale.photo.caption}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TWIST 3: The Twelve Swatches at the Foot along the Seam */}
      <div className="max-w-4xl mx-auto my-16 text-center space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8B8379] block">
          The 12 Palettes of the Soul
        </span>

        {/* The 12 Swatches Row */}
        <div className="flex items-center justify-center gap-3 py-2">
          {swatches.map((sw) => (
            <button
              key={sw.id}
              onClick={() => handleSwatchClick(sw)}
              onMouseEnter={() => setHoveredSwatch(sw.name)}
              onMouseLeave={() => setHoveredSwatch(null)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md transition-all duration-300 hover:scale-150 cursor-pointer border border-black/10 focus:outline-none"
              style={{ backgroundColor: sw.color }}
              title={sw.name}
              aria-label={sw.name}
            />
          ))}
        </div>

        {/* Active Hover Tooltip */}
        <div className="h-6">
          <p className="text-xs font-mono text-[#2A2622] font-semibold transition-opacity">
            {hoveredSwatch || "click any swatch to jump to its chapter"}
          </p>
        </div>
      </div>

      {/* FINAL GESTURE: "that's all of it, for now." and Seam Dot */}
      <div className="max-w-2xl mx-auto text-center pt-8 border-t border-[#2A2622]/15 space-y-6">
        <p className="font-serif italic text-2xl sm:text-3xl text-[#2A2622]">
          "{finale.line}"
        </p>

        {/* The Seam retracting into a single dot (the favicon) */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-[1px] h-8 bg-[#2A2622]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#B3342B] shadow-sm animate-pulse" />
          <span className="text-[9px] font-mono text-[#8B8379] uppercase tracking-widest">
            dot · favicon anchor
          </span>
        </div>
      </div>

    </section>
  );
};
