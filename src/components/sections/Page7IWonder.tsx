import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { WonderCategory } from '../../types/content';
import { Compass, Sparkles, X } from 'lucide-react';

export const Page7IWonder: React.FC = () => {
  const { content } = useContent();
  const { wonder } = content;
  const [selectedCat, setSelectedCat] = useState<WonderCategory | null>(wonder[0] || null);

  return (
    <section
      id="page-7"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#060C24] text-[#F4F6FB] overflow-hidden transition-colors duration-700 flex flex-col justify-between"
    >
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-100"
            style={{
              width: `${(i % 2) + 1}px`,
              height: `${(i % 2) + 1}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 29) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#2F6BFF] block">
          page 07 · observatory of curiosities
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#F4F6FB]">
          I WONDER
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#8E9AC4] max-w-md mx-auto">
          "Nine concentric gravitational orbits of questions that keep my mind racing late at night."
        </p>
      </div>

      {/* Orbiting Concentric Rings Container */}
      <div className="relative z-10 max-w-5xl mx-auto my-12 w-full h-[520px] flex items-center justify-center">
        
        {/* Ring 3 (Outer) */}
        <div className="absolute w-[460px] sm:w-[500px] h-[460px] sm:h-[500px] rounded-full border border-[#2F6BFF]/20 animate-[spin_120s_linear_infinite]" />

        {/* Ring 2 (Middle) */}
        <div className="absolute w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] rounded-full border border-[#2F6BFF]/30 animate-[spin_80s_linear_infinite_reverse]" />

        {/* Ring 1 (Inner) */}
        <div className="absolute w-[220px] sm:w-[260px] h-[220px] sm:h-[260px] rounded-full border border-[#2F6BFF]/40 animate-[spin_50s_linear_infinite]" />

        {/* Center Core */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-[#14204A] border border-[#2F6BFF] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(47,107,255,0.4)] text-center p-2">
          <Compass className="w-5 h-5 text-[#2F6BFF] mb-1 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-white">
            Curiosity
          </span>
        </div>

        {/* Categories Grid (Interactive Orbiting Buttons) */}
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 sm:gap-4 pointer-events-none p-6">
          {wonder.map((cat, idx) => {
            const isSelected = selectedCat?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`pointer-events-auto px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 shadow-md ${
                  isSelected
                    ? 'bg-[#2F6BFF] text-white scale-110 ring-2 ring-white/40 shadow-[0_0_15px_#2F6BFF]'
                    : 'bg-[#14204A]/90 text-[#F4F6FB] border border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:scale-105'
                }`}
                style={{
                  transform: `translate(${Math.cos((idx / wonder.length) * 2 * Math.PI) * 160}px, ${
                    Math.sin((idx / wonder.length) * 2 * Math.PI) * 160
                  }px)`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

      </div>

      {/* Selected Category Explorer Panel */}
      <div className="relative z-10 max-w-2xl mx-auto w-full min-h-[140px]">
        {selectedCat ? (
          <div className="bg-[#14204A]/90 p-6 rounded-2xl border border-[#2F6BFF]/40 shadow-2xl backdrop-blur-md animate-fadeIn space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#2F6BFF]">
                Ring {selectedCat.ring} · Gravitational Orbit
              </span>
              <h4 className="font-serif italic text-xl text-white">
                {selectedCat.name}
              </h4>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#8E9AC4] block mb-0.5">
                What I Explore
              </span>
              <p className="font-sans text-sm text-[#F4F6FB] leading-relaxed">
                {selectedCat.explores}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-[#2F6BFF] block mb-0.5">
                Why It Matters To Me
              </span>
              <p className="font-serif italic text-base text-blue-200">
                "{selectedCat.why}"
              </p>
            </div>
          </div>
        ) : null}
      </div>

    </section>
  );
};
