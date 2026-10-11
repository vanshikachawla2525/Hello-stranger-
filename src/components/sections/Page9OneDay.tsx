import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Cloud, MapPin, Sparkles } from 'lucide-react';

export const Page9OneDay: React.FC = () => {
  const { content } = useContent();
  const { dreams } = content;
  const [activeDreamIdx, setActiveDreamIdx] = useState(0);

  return (
    <section
      id="page-9"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#8FC4E8] text-[#1F3A52] overflow-hidden transition-colors duration-700 flex flex-col justify-between"
    >
      {/* Drifting Clouds SVG Silhouettes */}
      <div className="absolute top-12 left-10 opacity-40 pointer-events-none animate-pulse">
        <Cloud className="w-24 h-24 text-white" />
      </div>
      <div className="absolute top-28 right-20 opacity-30 pointer-events-none animate-pulse">
        <Cloud className="w-36 h-36 text-white" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#3F6786] block">
          page 09 · open sky timeline
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#1F3A52]">
          ONE DAY
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#3F6786] max-w-md mx-auto">
          "Dreams as physical geographies. Places where I want to stand and take a deep breath."
        </p>
      </div>

      {/* Flowing Horizontal Dreams Timeline */}
      <div className="relative z-10 max-w-6xl mx-auto my-12 w-full">
        {/* Curving SVG Path */}
        <div className="w-full h-8 relative mb-6">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 40">
            <path
              d="M 0,20 Q 250,5 500,20 T 1000,20"
              fill="none"
              stroke="#F08A3C"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Dreams Cards Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dreams.filter((d) => !d.hidden).map((dream, idx) => {
            const isSelected = activeDreamIdx === idx;
            return (
              <div
                key={dream.id}
                onClick={() => setActiveDreamIdx(idx)}
                className={`group rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-white/95 shadow-2xl border-[#F08A3C] scale-[1.02]'
                    : 'bg-white/70 shadow-sm border-white/40 hover:bg-white/90'
                }`}
              >
                {/* Photo 16:9 */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#3F6786]/20 mb-4">
                  <img
                    src={dream.photo.file}
                    alt={dream.photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {dream.year && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] backdrop-blur-xs">
                      {dream.year}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#F08A3C]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                      Destination
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1F3A52] leading-tight">
                    {dream.place}
                  </h3>
                  <p className="font-sans text-xs text-[#3F6786] line-clamp-3 pt-1">
                    "{dream.why}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center z-10 text-xs font-mono text-[#3F6786]">
        [the horizon is not a destination, it is an orientation]
      </div>
    </section>
  );
};
