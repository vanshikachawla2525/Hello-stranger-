import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { ProudItem } from '../../types/content';
import { Award, ArrowRight } from 'lucide-react';

export const Page6LookHowFar: React.FC = () => {
  const { content } = useContent();
  const { proud } = content;
  const visibleProud = proud.filter((p) => !p.hidden);
  const [activeIdx, setActiveIdx] = useState(0);

  const current = visibleProud[activeIdx] || visibleProud[0];

  if (!current) return null;

  return (
    <section
      id="page-6"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#0D0C0C] text-[#EFEBE3] overflow-hidden transition-colors duration-700 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2 z-10">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#8A857D] block">
          page 06 · quiet milestones
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#EFEBE3]">
          LOOK HOW FAR
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#8A857D] max-w-md mx-auto">
          "Pride, without the resume jargon. Measured in craft, discipline, and soul preserved."
        </p>
      </div>

      {/* Main Scene: Giant Numeral + Story Showcase */}
      <div className="relative max-w-6xl mx-auto my-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Giant Numeral Background / Graphic */}
        <div className="lg:col-span-5 relative flex flex-col justify-center select-none">
          {current.number && (
            <div className="text-[7rem] sm:text-[11rem] lg:text-[13rem] font-serif font-bold text-transparent [-webkit-text-stroke:2px_#6E1F2A] leading-none opacity-90 transition-all duration-700">
              {current.number.value}
              <span className="text-3xl sm:text-5xl font-mono text-[#EFEBE3] ml-2">
                {current.number.unit}
              </span>
            </div>
          )}
          {current.number?.label && (
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A857D] mt-2 block">
              {current.number.label}
            </span>
          )}
        </div>

        {/* Narrative & Photo Card */}
        <div className="lg:col-span-7 bg-[#1A1818] p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-mono text-xs text-[#8A857D] uppercase tracking-wider">
              {current.date}
            </span>
            <span className="text-[10px] font-mono text-[#6E1F2A] uppercase font-bold tracking-widest">
              Milestone {activeIdx + 1} of {proud.length}
            </span>
          </div>

          <h3 className="font-serif text-2xl sm:text-4xl text-[#EFEBE3]">
            {current.title}
          </h3>

          <p className="font-sans text-sm sm:text-base text-[#8A857D] leading-relaxed">
            {current.story}
          </p>

          {/* Milestone Photo */}
          {current.photo && (
            <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-lg">
              <img
                src={current.photo.file}
                alt={current.photo.alt}
                className="w-full h-full object-cover"
              />
              {current.photo.caption && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs p-2 rounded text-[11px] font-mono text-white/90">
                  {current.photo.caption}
                </div>
              )}
            </div>
          )}

          {/* Pagination Navigation */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {visibleProud.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    activeIdx === i ? 'w-8 bg-[#6E1F2A]' : 'w-2 bg-white/20'
                  }`}
                  aria-label={`Milestone ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveIdx((prev) => (prev + 1) % visibleProud.length)}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#EFEBE3] hover:text-[#6E1F2A] transition-colors"
            >
              <span>next story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      <div className="text-center z-10 text-xs font-mono text-[#8A857D]">
        [every milestone is anchored in patience and craftsmanship]
      </div>
    </section>
  );
};
