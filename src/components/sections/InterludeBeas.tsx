import React from 'react';
import { useContent } from '../../context/ContentContext';

export const InterludeBeas: React.FC = () => {
  const { content, isPreviewMode } = useContent();
  const { interludeBeas } = content;
  
  if (interludeBeas.hidden && !isPreviewMode) {
    return null;
  }

  const isApproved = interludeBeas.approved || isPreviewMode;

  return (
    <section
      id="page-beas"
      className="relative min-h-[90vh] w-full py-28 px-4 sm:px-8 lg:px-16 flex flex-col justify-center items-center bg-[#0E1A33] text-[#F2EAD8] transition-colors duration-700 overflow-hidden"
    >
      {/* Gentle Gold River Thread SVG (Controlled by thread.enabled toggle) */}
      {content.thread?.enabled !== false && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
            <path
              d="M 500,0 C 450,250 550,500 480,750 C 430,900 520,1000 500,1000"
              fill="none"
              stroke="#C9A45C"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A45C] block">
          interlude a · the silence
        </span>

        {/* Lines appearing with quiet dignity (only if approved or in owner preview) */}
        {isApproved ? (
          <div className="space-y-4">
            {interludeBeas.lines.map((line, idx) => (
              <p
                key={idx}
                className="font-serif italic text-2xl sm:text-4xl text-[#F2EAD8] tracking-tight leading-relaxed"
              >
                "{line}"
              </p>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-[#C9A45C]/40 rounded-2xl">
            <p className="font-handwriting text-2xl text-[#C9A45C]">
              [PLACEHOLDER: Beas lines awaiting owner approval]
            </p>
          </div>
        )}

        {/* River photo at dusk */}
        {interludeBeas.photo && (
          <div className="mt-12 rounded-2xl overflow-hidden border border-[#C9A45C]/30 shadow-2xl max-w-2xl mx-auto bg-black/40">
            <img
              src={interludeBeas.photo.file}
              alt={interludeBeas.photo.alt}
              className="w-full h-72 sm:h-96 object-cover brightness-95"
            />
            {interludeBeas.photo.caption && (
              <div className="p-3 bg-[#0E1A33]/90 text-xs font-mono text-[#A9A28F] text-center border-t border-[#C9A45C]/20">
                {interludeBeas.photo.caption}
              </div>
            )}
          </div>
        )}

        <div className="pt-8">
          <span className="text-xs font-mono tracking-widest text-[#A9A28F] uppercase">
            Beas, Punjab · Where soul unhurries
          </span>
        </div>
      </div>
    </section>
  );
};
