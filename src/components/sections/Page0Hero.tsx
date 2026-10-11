import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { ArrowDown, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export const Page0Hero: React.FC = () => {
  const { content, marginaliaEnabled } = useContent();
  const [starRotated, setStarRotated] = useState<number | null>(null);
  const [mobileGalleryIdx, setMobileGalleryIdx] = useState(0);

  const { hero, identity } = content;

  const mobileGallery = [
    hero.panorama,
    hero.portraitSecondary || hero.panorama,
    hero.portrait,
  ];

  return (
    <section
      id="page-0"
      className="relative min-h-screen w-full flex flex-col justify-between pt-8 pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden select-none"
    >
      {/* Marginalia Layer (Section 2.4 & Reference videos) */}
      {marginaliaEnabled && (
        <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
          {/* Label 1: Page index */}
          <div className="absolute top-8 left-[40%] text-[10px] font-mono tracking-wider text-[var(--muted)] opacity-70">
            Page 0 · Autobiographical
          </div>

          {/* Label 2: CSS Token readout */}
          <div className="absolute top-8 right-16 text-[10px] font-mono tracking-wider text-[var(--muted)] opacity-70">
            --bg: #EFE8DA · --t-hero
          </div>

          {/* Label 3: Panorama annotation with curved arrow */}
          <div className="absolute top-[28%] left-[22%] text-[10px] font-mono tracking-wider text-[var(--muted)] flex items-center gap-2">
            <span>hero.panorama</span>
            <svg className="w-8 h-4 text-[var(--muted)]" viewBox="0 0 32 16" fill="none">
              <path d="M0 8 Q16 2 28 10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="28" cy="10" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Label 4: Portrait annotation */}
          <div className="absolute top-[48%] right-[10%] text-[10px] font-mono tracking-wider text-[var(--muted)] flex items-center gap-2">
            <svg className="w-8 h-4 text-[var(--muted)]" viewBox="0 0 32 16" fill="none">
              <path d="M32 8 Q16 14 4 6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="4" cy="6" r="1.5" fill="currentColor" />
            </svg>
            <span>hero.portrait</span>
          </div>
        </div>
      )}

      {/* Floating Date Stamp & Stars */}
      <div className="absolute top-12 left-8 md:left-[40%] flex items-center gap-4 text-xs font-mono text-[var(--muted)] z-10">
        <span className="px-2 py-0.5 rounded border border-[var(--line)] bg-[var(--bg)] shadow-xs">
          19 · 10 · 2026
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-serif italic">
          today.
        </span>
      </div>

      {/* Center Collage Composition */}
      <div className="relative w-full max-w-6xl mx-auto my-auto pt-12 pb-8 flex flex-col items-center">
        
        {/* "hello, stranger." kicker */}
        <div className="w-full text-left md:text-left md:pl-[38%] mb-2 z-20">
          <p className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight">
            hello, stranger.
          </p>
        </div>

        {/* Collage Frame Containers */}
        <div className="relative w-full h-[52vh] sm:h-[58vh] max-h-[600px] flex items-center justify-center">
          
          {/* 1. Cinematic Panorama Background (Desktop) */}
          <div className="hidden sm:block absolute inset-x-4 sm:inset-x-8 top-6 bottom-10 rounded-2xl overflow-hidden shadow-xl border border-[#1B1713]/10 bg-[#EFE8DA]">
            <img
              src={hero.panorama.file}
              alt={hero.panorama.alt}
              className="w-full h-full object-cover brightness-[0.98] transition-transform duration-10000 hover:scale-105"
            />
            {/* Washi tape on top-left of panorama */}
            <div className="absolute -top-3 left-10 w-24 h-6 washi-tape rotate-[-4deg] z-10" />
            
            {/* Caption on bottom right */}
            <div className="absolute bottom-3 right-4 text-[10px] font-mono text-white/80 bg-black/40 px-2.5 py-1 rounded backdrop-blur-xs">
              {hero.panorama.caption || 'Cappadocia at sunrise'}
            </div>
          </div>

          {/* Mobile Swipeable Gallery */}
          <div className="sm:hidden relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-[#1B1713]/10 bg-[#EFE8DA]">
            <img
              src={mobileGallery[mobileGalleryIdx]?.file}
              alt="Mobile hero"
              className="w-full h-full object-cover"
            />
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {mobileGallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMobileGalleryIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    mobileGalleryIdx === i ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 2. Overlapping Editorial Portrait (Extending beyond bottom & left as in reference video) */}
          <div className="absolute right-4 sm:right-12 bottom-0 sm:-bottom-6 w-44 sm:w-64 md:w-80 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-white/60 bg-[#EFE8DA] z-20 transition-transform duration-500 hover:rotate-1">
            <img
              src={hero.portrait.file}
              alt={hero.portrait.alt}
              className="w-full h-full object-cover object-top"
            />
            {/* Washi tape on portrait top corner */}
            <div className="absolute -top-3 right-6 w-20 h-5 washi-tape rotate-[6deg] z-30" />
            
            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
              {hero.portrait.caption || 'Vanshika Chawla'}
            </div>
          </div>

          {/* 3. The Gigantic Name: "Vanshika Chawla"
              Using difference blend mode so letters automatically flip to white where they cross the photo,
              perfectly reproducing Section 1 & Section 6 requirement! */}
          <div className="absolute bottom-4 sm:bottom-8 left-2 sm:left-12 z-30 pointer-events-none mix-blend-difference text-white">
            <h1 className="font-serif text-hero-fluid tracking-tighter leading-none whitespace-nowrap">
              {identity.name}
            </h1>
          </div>

          {/* Duplicate fallback name layer beneath in case mix-blend isn't supported */}
          <div className="absolute bottom-4 sm:bottom-8 left-2 sm:left-12 z-10 pointer-events-none text-[var(--ink)] opacity-30 sm:hidden">
            <h1 className="font-serif text-hero-fluid tracking-tighter leading-none whitespace-nowrap">
              {identity.name}
            </h1>
          </div>

        </div>

        {/* Subline and 4 Words Row */}
        <div className="w-full max-w-4xl mt-6 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-20">
          
          <div>
            <p className="font-serif italic text-lg sm:text-2xl text-[var(--ink)]">
              "{identity.subline}"
            </p>

            {/* The 4 Words Row: lens | muse | doer | bold */}
            <div className="flex items-center gap-3 mt-2 text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
              {identity.fourWords.map((fw, idx) => (
                <React.Fragment key={fw.word}>
                  <span className="hover:text-[var(--ink)] cursor-default transition-colors">
                    {fw.word.toLowerCase()}
                  </span>
                  {idx < identity.fourWords.length - 1 && (
                    <span className="text-[var(--line)]">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Two Primary Action Buttons from Brief */}
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <a
              href="#page-1"
              className="px-5 py-2.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-xs font-medium tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
              <span>NO BIG DEAL.</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>

            <a
              href="#page-2"
              className="px-5 py-2.5 rounded-full border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)] text-xs font-medium tracking-wide transition-colors"
            >
              <span>THE OTHER SIDE.</span>
            </a>
          </div>

        </div>

      </div>

      {/* Hero Bottom Bar Details (Notes & Rotating Star) */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between pt-6 border-t border-[var(--line)] text-xs font-mono text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <span className="font-handwriting text-lg text-[var(--ink)]">
            "{hero.notes[1] || 'everything begins in the margins'}"
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStarRotated((prev) => (prev ? prev + 360 : 360))}
            className="cursor-pointer transition-transform duration-500 hover:scale-125"
            style={{ transform: `rotate(${starRotated || 0}deg)` }}
            title="Click to spin lucky star"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          </button>
          <span className="text-[10px] uppercase tracking-wider">scroll to enter</span>
        </div>
      </div>

    </section>
  );
};
