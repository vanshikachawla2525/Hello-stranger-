import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Target, Compass } from 'lucide-react';

export const Page8NotYet: React.FC = () => {
  const { content } = useContent();
  const { notYet, touchstones } = content;
  const [activeAmbition, setActiveAmbition] = useState<string | null>(null);

  const ambitionWords = ['build', 'explore', 'create', 'learn', 'travel', 'experience', 'become'];

  return (
    <section
      id="page-8"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#C0643F] text-[#F6EADB] overflow-hidden transition-colors duration-700"
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2 mb-12">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#F0C9B6] block">
          page 08 · the unfinished horizon
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#F6EADB]">
          NOT YET
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#F0C9B6] max-w-md mx-auto">
          "The gap between who I am today and who I am learning to become. The sentence is deliberately open."
        </p>
      </div>

      {/* Center Cinematic Image + 7 Ambitions with 86% line */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Ambition Words with 86% Line */}
        <div className="lg:col-span-6 space-y-5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F0C9B6] block">
            The Seven Ambitions · [Never 100% Closed]
          </span>

          <div className="space-y-4">
            {ambitionWords.map((word) => {
              const meaning = notYet.ambitions[word] || 'in constant progress';
              const isHovered = activeAmbition === word;
              return (
                <div
                  key={word}
                  onMouseEnter={() => setActiveAmbition(word)}
                  onMouseLeave={() => setActiveAmbition(null)}
                  className="group cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif italic text-2xl sm:text-3xl text-[#F6EADB] group-hover:text-white transition-colors">
                      {word}
                    </span>
                    <span className="text-xs font-mono text-[#F0C9B6] opacity-0 group-hover:opacity-100 transition-opacity">
                      86%
                    </span>
                  </div>

                  {/* The Signature "86% Line" that deliberately leaves a gap! */}
                  <div className="w-full h-[1px] bg-white/20 relative">
                    <div
                      className="h-full bg-[#F6EADB] transition-all duration-500"
                      style={{ width: '86%' }}
                    />
                    {/* Tiny dot at 86% mark */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[86%] w-1.5 h-1.5 rounded-full bg-[#F6EADB]" />
                  </div>

                  {/* Expanded description on hover or active */}
                  <p className={`text-xs font-sans text-[#F0C9B6] transition-all duration-300 ${
                    isHovered ? 'opacity-100 pt-1' : 'opacity-70 line-clamp-1'
                  }`}>
                    "{meaning}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Large Cinematic Photo */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-[#3B1D14]/40 aspect-[4/3]">
            <img
              src={notYet.photo.file}
              alt={notYet.photo.alt}
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
            {notYet.photo.caption && (
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/60 backdrop-blur-xs rounded-xl text-xs font-mono text-white/90">
                {notYet.photo.caption}
              </div>
            )}
          </div>

          {/* What I Want to Improve Note */}
          <div className="p-5 bg-[#3B1D14]/60 rounded-xl border border-white/15 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D9A19A] block">
              Self-Reflection · The Quiet Craft
            </span>
            <p className="font-serif italic text-lg sm:text-xl text-[#F6EADB]">
              "{notYet.improve}"
            </p>
          </div>
        </div>

      </div>

      {/* INTERLUDE B: LEHAR (The Wave Horizon - controllable via interludeB toggle) */}
      {content.interludeB?.enabled !== false && (
        <div className="max-w-4xl mx-auto mt-20 pt-16 border-t border-white/20 text-center space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#F0C9B6] block">
            interlude b · the wave in the heart
          </span>
          <h3 className="font-serif text-3xl sm:text-4xl italic text-white">
            "{touchstones.song}"
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#F0C9B6]">
            "{touchstones.songLine}"
          </p>

          {/* SVG Sine Wave Horizon */}
          <div className="w-full h-16 relative overflow-hidden py-4 opacity-75">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <path
                d="M 0,50 Q 250,10 500,50 T 1000,50"
                fill="none"
                stroke="#F6EADB"
                strokeWidth="2"
              />
              <path
                d="M 0,55 Q 250,90 500,55 T 1000,55"
                fill="none"
                stroke="#D9A19A"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      )}

    </section>
  );
};
