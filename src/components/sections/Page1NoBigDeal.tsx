import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { PolaroidItem } from '../../types/content';
import { Maximize2, X, Sparkles } from 'lucide-react';

export const Page1NoBigDeal: React.FC = () => {
  const { content, marginaliaEnabled } = useContent();
  const { noBigDeal } = content;

  // Ransom letter fonts & styling variations
  const fontPool = [
    'font-cutout-fatface',
    'font-cutout-bevan',
    'font-typewriter',
    'font-serif',
    'font-courier',
  ];
  const bgPool = [
    'bg-[#1B1713] text-[#FBF9F5]',
    'bg-[#C8322B] text-white',
    'bg-[#E9D9A6] text-[#2A1E18]',
    'bg-[#FBF9F5] text-[#1B1713] border border-[#1B1713]/30',
    'bg-[#C9A878] text-[#1B1713]',
  ];

  const initialLetters = "NO BIG DEAL".split('').map((char, index) => ({
    char,
    font: fontPool[index % fontPool.length],
    bg: bgPool[(index * 2) % bgPool.length],
    rot: ((index % 5) - 2) * 3, // tilt -6deg to +6deg
  }));

  const [ransomLetters, setRansomLetters] = useState(initialLetters);
  const [selectedPolaroid, setSelectedPolaroid] = useState<PolaroidItem | null>(null);
  const [isDeveloped, setIsDeveloped] = useState<Record<string, boolean>>({});
  const [isTorn, setIsTorn] = useState(false);

  const reRollLetter = (idx: number) => {
    setRansomLetters((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        font: fontPool[Math.floor(Math.random() * fontPool.length)],
        bg: bgPool[Math.floor(Math.random() * bgPool.length)],
        rot: Math.floor(Math.random() * 16) - 8,
      };
      return next;
    });
  };

  const handleDevelop = (id: string) => {
    setIsDeveloped((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setIsDeveloped((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <section
      id="page-1"
      className="relative min-h-screen w-full py-20 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#F4EBD6] text-[#2A1E18] transition-colors duration-700"
    >
      {/* Red Gingham Ribbon across top with handwritten line & paperclip */}
      <div className="relative max-w-6xl mx-auto mb-10 overflow-hidden">
        <div className="relative inline-block w-full sm:w-auto -rotate-1 bg-gingham-red px-8 py-3 rounded-md shadow-md border border-[#C8322B]/30">
          {/* Paperclip SVG */}
          <div className="absolute -top-3 left-3 w-6 h-10 pointer-events-none">
            <svg viewBox="0 0 24 40" fill="none" stroke="#7A7064" strokeWidth="2.5">
              <path d="M8 10 V28 C8 33 16 33 16 28 V6 C16 2 4 2 4 6 V30" />
            </svg>
          </div>

          <p className="font-handwriting text-xl sm:text-2xl text-[#1B1713] tracking-wide pl-4">
            {noBigDeal.ribbonLine}
          </p>
        </div>
      </div>

      {/* Scrapbook Open Notebook Spread Layout */}
      <div className="relative max-w-6xl mx-auto bg-[#FDF9F0] rounded-2xl shadow-xl border border-[#2A1E18]/15 p-6 sm:p-12 overflow-hidden">
        
        {/* Black Binding Strip with Punched Holes on Left Edge */}
        <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-[#2B211B] flex flex-col justify-around items-center py-6 z-20 shadow-inner">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#F4EBD6] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          ))}
        </div>

        {/* Yellow Side Tab on Right Edge */}
        <div className="absolute top-20 -right-2 sm:-right-3 bg-[#F2C230] text-[#1B1713] px-3 py-1 text-[10px] font-mono uppercase tracking-widest -rotate-90 origin-right rounded-t-md shadow-sm z-20">
          PAGE 01 · SCRAP
        </div>

        {/* Graph Paper Corner Bottom Left */}
        <div className="absolute bottom-0 left-12 w-32 h-32 bg-graph-paper opacity-40 pointer-events-none" />

        {/* Marginalia Annotations */}
        {marginaliaEnabled && (
          <div className="hidden sm:block absolute top-6 right-16 text-[10px] font-mono text-[#7C6A58] opacity-75">
            [click any letter to re-roll font / hold Polaroid to develop]
          </div>
        )}

        <div className="pl-6 sm:pl-10">

          {/* RANSOM TITLE CUT-OUT: "NO BIG DEAL" */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-4 select-none">
            {ransomLetters.map((item, idx) => {
              if (item.char === ' ') {
                return <span key={idx} className="w-4 sm:w-8" />;
              }
              return (
                <button
                  key={idx}
                  onClick={() => reRollLetter(idx)}
                  className={`inline-flex items-center justify-center w-10 h-14 sm:w-16 sm:h-20 text-2xl sm:text-4xl shadow-md rounded-xs transition-transform duration-200 active:scale-90 hover:scale-110 cursor-pointer ${item.font} ${item.bg}`}
                  style={{ transform: `rotate(${item.rot}deg)` }}
                  title="Click to re-roll letter cut-out style"
                >
                  {item.char}
                </button>
              );
            })}
          </div>

          <p className="font-typewriter text-xs sm:text-sm text-[#7C6A58] mt-2 tracking-wide">
            "the version everyone sees. unedited, tactile, and completely unapologetic."
          </p>

          {/* Film-strip Marquee Ribbon of Handwritten Inside Jokes */}
          <div className="my-8 py-3 bg-[#2B211B] rounded-lg overflow-hidden shadow-inner text-white flex items-center">
            {/* Film sprockets and marquee */}
            <div className="flex gap-8 whitespace-nowrap animate-marquee font-typewriter text-xs tracking-wider">
              {noBigDeal.marquee.concat(noBigDeal.marquee).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8322B]" />
                  <span>{item}</span>
                  <span className="text-[#C9A878] text-[10px] font-mono">[{idx + 1}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* Polaroids Masonry Grid with Washi Tape and Pins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-6">
            {noBigDeal.polaroids.filter((p) => !p.hidden).map((pol) => {
              const developed = isDeveloped[pol.id];
              return (
                <div
                  key={pol.id}
                  className="group relative bg-[#FBF9F3] p-3 pb-8 rounded-xs shadow-lg hover:shadow-2xl transition-all duration-300 hover:rotate-0 hover:scale-105 cursor-pointer"
                  style={{ transform: `rotate(${pol.tilt || 0}deg)` }}
                  onClick={() => setSelectedPolaroid(pol)}
                  onMouseDown={() => handleDevelop(pol.id)}
                  title="Click to expand / hold to develop"
                >
                  {/* Washi Tape on top center */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 washi-tape rotate-[-2deg] z-10" />

                  {/* Red / Blue Push Pin SVG */}
                  <div className="absolute -top-2 right-4 w-4 h-4 z-20">
                    <div className="w-3 h-3 rounded-full bg-[#D6222B] shadow-md border border-white/60" />
                  </div>

                  {/* Polaroid Photo Image */}
                  <div className="relative aspect-square w-full rounded-xs overflow-hidden bg-[#2B211B]">
                    <img
                      src={pol.photo.file}
                      alt={pol.photo.alt}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        developed ? 'sepia contrast-125 blur-[0.5px]' : 'sepia-[0.12] contrast-[1.04]'
                      }`}
                    />

                    {/* Develop feedback badge */}
                    {developed && (
                      <div className="absolute inset-0 bg-amber-900/30 flex items-center justify-center text-[10px] text-white font-mono uppercase tracking-widest backdrop-blur-[1px]">
                        developing...
                      </div>
                    )}
                  </div>

                  {/* Handwritten Caption */}
                  <div className="mt-4 text-center">
                    <p className="font-handwriting text-xl text-[#2A1E18] tracking-wide leading-none">
                      {pol.caption}
                    </p>
                    {pol.note && (
                      <span className="text-[10px] font-mono text-[#7C6A58] block mt-1">
                        {pol.note}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Random Facts & Stickers Row */}
          <div className="mt-8 pt-6 border-t border-[#2A1E18]/10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Typewriter memo note */}
            <div className="p-4 bg-[#F6F0E4] rounded-lg border border-[#2A1E18]/15 shadow-xs relative">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8322B] font-bold block mb-1">
                MEMO · ARCHIVE OBSERVATION
              </span>
              <p className="font-typewriter text-xs text-[#2A1E18] leading-relaxed">
                "{noBigDeal.randomFacts[0]}"
              </p>
              <div className="mt-2 text-right">
                <span className="font-courier text-[10px] text-[#7C6A58] tracking-widest">
                  BARCODE: 89019102026
                </span>
              </div>
            </div>

            {/* Sunburst & Cherry Stickers */}
            <div className="flex items-center justify-around">
              {/* Sunburst Sticker */}
              <div className="w-16 h-16 rounded-full bg-[#F2C230] text-[#1B1713] flex items-center justify-center font-bold text-[9px] uppercase tracking-tighter text-center shadow-md rotate-6 hover:rotate-12 transition-transform cursor-pointer">
                100%<br />DOER
              </div>

              {/* Black Disc Sticker with Orange Dot */}
              <div className="w-12 h-12 rounded-full bg-[#1B1713] flex items-center justify-center shadow-md">
                <div className="w-3 h-3 rounded-full bg-[#F08A3C]" />
              </div>

              {/* Push Pin Note */}
              <div className="font-handwriting text-lg text-[#C8322B] -rotate-3">
                ~ rockstar on repeat
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* THE TEAR (End of Section Transition from Brief) */}
      <div className="relative max-w-6xl mx-auto mt-16 pt-12 text-center">
        <div className="p-8 rounded-2xl bg-[#F6F0E4] border border-[#2A1E18]/15 shadow-md max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#7C6A58]">
            The Seam Transition
          </span>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-[#1B1713]">
            "{noBigDeal.tearLine}"
          </h3>
          <p className="text-xs text-[#7C6A58]">
            Scroll or click to peel the scrapbook page and reveal the private journal drafts.
          </p>
          <a
            href="#page-2"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2A1E18] text-[#F6F0E4] text-xs font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            <span>ENTER THE DRAFTS</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Polaroid Lightbox Expansion */}
      {selectedPolaroid && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedPolaroid(null)}
        >
          <div
            className="relative bg-[#FBF9F3] p-4 sm:p-6 pb-12 rounded-xs shadow-2xl max-w-lg w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPolaroid(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#1B1713]/10 flex items-center justify-center text-[#1B1713] hover:bg-[#1B1713]/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full aspect-square rounded-xs overflow-hidden bg-[#2B211B] mb-4">
              <img
                src={selectedPolaroid.photo.file}
                alt={selectedPolaroid.photo.alt}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-handwriting text-3xl text-[#2A1E18]">
              {selectedPolaroid.caption}
            </p>
            {selectedPolaroid.photo.caption && (
              <p className="font-sans text-xs text-[#7C6A58] mt-2">
                {selectedPolaroid.photo.caption}
              </p>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
