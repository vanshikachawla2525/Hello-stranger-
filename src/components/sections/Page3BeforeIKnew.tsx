import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Play, Pause, ChevronLeft, ChevronRight, Film } from 'lucide-react';

export const Page3BeforeIKnew: React.FC = () => {
  const { content } = useContent();
  const { childhood, hero } = content;
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const photos = childhood.photos.filter((p) => !p.hidden);
  const currentPhoto = photos[activeFrameIdx] || photos[0];

  const handleNext = () => {
    setActiveFrameIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setActiveFrameIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <section
      id="page-3"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#F3E6D0] text-[#4A3527] transition-colors duration-700"
    >
      {/* Header and Timecode Marquee */}
      <div className="max-w-6xl mx-auto mb-10 text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#8C6F58] block">
          page 03 · 35mm archive
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#4A3527]">
          BEFORE I KNEW
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#8C6F58] max-w-lg mx-auto">
          "The past as a family archive. Kodak 400 silver halide frames, preserved unhurried."
        </p>

        {/* Looping Timecode Ribbon */}
        <div className="pt-4 flex items-center justify-center gap-6 text-[11px] font-mono tracking-widest text-[#8C6F58] opacity-80">
          <span>KODAK SAFETY FILM 400</span>
          <span>·</span>
          <span>EXP 1998-2026</span>
          <span>·</span>
          <span>FRAME {String(activeFrameIdx + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Real Film Strip Container (Dark #2B211B bar with sprocket holes) */}
      <div className="max-w-6xl mx-auto bg-[#2B211B] rounded-2xl shadow-2xl p-4 sm:p-8 text-white overflow-hidden border border-[#D49A5A]/30">
        
        {/* Top Sprocket Holes Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 overflow-hidden">
          <div className="flex gap-4 sm:gap-6">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-6 sm:w-5 sm:h-7 rounded-[3px] bg-[#140F0D] border border-white/20 shadow-inner shrink-0"
              />
            ))}
          </div>
          <span className="text-[10px] font-mono tracking-widest text-[#D49A5A] uppercase shrink-0 pl-4">
            ROLL 42A
          </span>
        </div>

        {/* Center Frame Showcase */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Main 4:3 Photographic Frame */}
          <div className="md:col-span-8 relative aspect-[4/3] rounded-lg overflow-hidden bg-black border-2 border-white/10 shadow-2xl">
            <img
              src={currentPhoto.photo.file}
              alt={currentPhoto.photo.alt}
              className="w-full h-full object-cover sepia-[0.18] contrast-[1.05]"
            />

            {/* Frame Edge Codes Overlay */}
            <div className="absolute top-2 left-3 text-[10px] font-mono text-amber-300/80 drop-shadow">
              KODAK 400 · {currentPhoto.year}
            </div>
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-amber-300/80 drop-shadow">
              FRAME {activeFrameIdx + 12}A
            </div>
          </div>

          {/* Frame Story & Memory Details */}
          <div className="md:col-span-4 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-3xl sm:text-5xl font-serif text-[#D49A5A] font-bold">
                {currentPhoto.year}
              </span>
              <p className="font-sans text-xs uppercase tracking-widest text-white/60 mt-1">
                Timecode: {currentPhoto.timecode || '00:00'}
              </p>
            </div>

            <p className="font-handwriting text-2xl text-amber-100 leading-snug">
              "{currentPhoto.caption}"
            </p>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D49A5A] block mb-1">
                archival memory note
              </span>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                {childhood.memories[activeFrameIdx % childhood.memories.length]}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Previous frame"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Next frame"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs font-mono text-white/60">
                {activeFrameIdx + 1} / {photos.length}
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Sprocket Holes Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 overflow-hidden">
          <div className="flex gap-4 sm:gap-6">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-6 sm:w-5 sm:h-7 rounded-[3px] bg-[#140F0D] border border-white/20 shadow-inner shrink-0"
              />
            ))}
          </div>
          <span className="text-[10px] font-mono tracking-widest text-[#D49A5A] uppercase shrink-0 pl-4">
            SAFETY NEGATIVE
          </span>
        </div>

      </div>

      {/* AUDIO-STYLE TIMELINE SCRUBBER (Section 1 & 6 from reference video) */}
      <div className="max-w-4xl mx-auto mt-10 bg-white/70 p-6 rounded-2xl border border-[#4A3527]/15 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#8C6F58]">
          <span className="font-bold uppercase tracking-wider">Timeline Scrubber</span>
          <span>
            Scrubbing Frame {activeFrameIdx + 1}: Year {currentPhoto.year}
          </span>
        </div>

        {/* The Track with Year Ticks and Avatar Thumb */}
        <div className="relative py-4">
          {/* Base track */}
          <div className="w-full h-2 bg-[#EBC3A0] rounded-full relative">
            {/* Progress fill */}
            <div
              className="h-full bg-[#D49A5A] rounded-full transition-all duration-300"
              style={{ width: `${((activeFrameIdx + 1) / photos.length) * 100}%` }}
            />
          </div>

          {/* Ticks & Avatars */}
          <div className="absolute top-1 inset-x-0 flex items-center justify-between pointer-events-none">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveFrameIdx(idx)}
                className="pointer-events-auto group flex flex-col items-center -translate-y-2 cursor-pointer focus:outline-none"
              >
                {/* 28px Round Avatar Thumb as specified in Brief! */}
                <div
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    activeFrameIdx === idx
                      ? 'border-[#4A3527] scale-125 shadow-md ring-2 ring-[#D49A5A]'
                      : 'border-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={hero.portrait.file}
                    alt="avatar thumb"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-mono text-[#4A3527] font-semibold mt-1">
                  {p.year}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
};
