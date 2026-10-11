import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { PersonNode } from '../../types/content';
import { Sparkles, Heart } from 'lucide-react';

export const Page4PeopleICarry: React.FC = () => {
  const { content } = useContent();
  const { people } = content;
  const visiblePeople = people.filter((p) => !p.hidden);
  const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>(visiblePeople[0] || null);

  // Generate dynamic constellation connection lines that adapt to any count (1 to 12 items)
  const lines = React.useMemo(() => {
    if (visiblePeople.length <= 1) return [];
    const generated: { from: number; to: number }[] = [];
    const centerIdx = visiblePeople.findIndex((p) => p.name.toLowerCase().includes('vanshika')) >= 0
      ? visiblePeople.findIndex((p) => p.name.toLowerCase().includes('vanshika'))
      : Math.floor(visiblePeople.length / 2);

    for (let i = 0; i < visiblePeople.length; i++) {
      if (i !== centerIdx) {
        generated.push({ from: i, to: centerIdx });
      }
      if (i > 0 && i !== centerIdx && (i - 1) !== centerIdx) {
        generated.push({ from: i - 1, to: i });
      }
    }
    return generated;
  }, [visiblePeople]);

  return (
    <section
      id="page-4"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#0E1A33] text-[#F2EAD8] overflow-hidden transition-colors duration-700"
    >
      {/* Background Twinkling Starfield */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40 animate-pulse"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animationDuration: `${(i % 4) + 2}s`,
            }}
          />
        ))}

        {/* Shooting star streak */}
        <div className="absolute top-1/4 -left-10 w-40 h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-white rotate-[-25deg] animate-[ping_12s_infinite]" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-12 space-y-2">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A45C] block">
          page 04 · celestial map
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#F2EAD8]">
          PEOPLE I CARRY
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#A9A28F] max-w-md mx-auto">
          "Naming the stars after the people who anchor my soul. Tap any star tag to reveal our story."
        </p>
      </div>

      {/* Constellation Canvas & Interactive Nodes */}
      <div className="relative z-10 max-w-5xl mx-auto h-[620px] rounded-3xl border border-[#C9A45C]/20 bg-[#0E1A33]/80 backdrop-blur-md p-6 overflow-hidden shadow-2xl">
        
        {/* SVG Glowing Constellation Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {lines.map((line, idx) => {
            const p1 = visiblePeople[line.from];
            const p2 = visiblePeople[line.to];
            if (!p1 || !p2) return null;
            return (
              <line
                key={idx}
                x1={`${p1.x}%`}
                y1={`${p1.y}%`}
                x2={`${p2.x}%`}
                y2={`${p2.y}%`}
                stroke="#BFD6FF"
                strokeWidth="1.2"
                strokeOpacity="0.75"
                filter="url(#glow)"
              />
            );
          })}
        </svg>

        {/* Star Nodes with Gold Name Tags (Matching reference video exactly!) */}
        {visiblePeople.map((person) => {
          const isSelected = selectedPerson?.id === person.id;
          return (
            <div
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 z-20"
              style={{ left: `${person.x}%`, top: `${person.y}%` }}
            >
              {/* Star Core */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-4 h-4 rounded-full transition-transform duration-300 ${
                    isSelected
                      ? 'bg-white scale-150 ring-4 ring-[#C9A45C] shadow-[0_0_20px_#C9A45C]'
                      : 'bg-[#BFD6FF] group-hover:scale-125'
                  }`}
                />
                <div className="absolute inset-0 rounded-full bg-blue-300 animate-ping opacity-30" />
              </div>

              {/* Gold Name Tag (as seen in video: small rounded rectangle in #C9A45C with dark text) */}
              <div
                className={`mt-2 px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold tracking-wide whitespace-nowrap transition-all shadow-md ${
                  isSelected
                    ? 'bg-[#C9A45C] text-[#0E1A33] scale-105 ring-2 ring-white/50'
                    : 'bg-[#C9A45C]/90 text-[#0E1A33] hover:bg-[#C9A45C]'
                }`}
              >
                {person.name}
              </div>
            </div>
          );
        })}

        {/* Selected Person Detail Card Overlay (Bottom / Side drawer) */}
        {selectedPerson && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 bg-[#16264A]/95 border border-[#C9A45C]/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-slideUp z-30">
            <div className="flex items-start gap-4">
              {/* Photo */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#C9A45C] shrink-0 bg-black/40">
                <img
                  src={selectedPerson.photo.file}
                  alt={selectedPerson.photo.alt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A45C]">
                  {selectedPerson.relationship}
                </span>
                <h4 className="font-serif italic text-2xl text-[#F2EAD8] leading-tight">
                  {selectedPerson.name}
                </h4>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#C9A45C]/20 space-y-2">
              <p className="font-handwriting text-xl text-amber-200 leading-snug">
                "{selectedPerson.note}"
              </p>
              <div className="p-2.5 bg-black/30 rounded-lg text-xs font-sans text-[#F2EAD8]/80">
                <span className="text-[#C9A45C] font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                  Shared Moment
                </span>
                {selectedPerson.moment}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
