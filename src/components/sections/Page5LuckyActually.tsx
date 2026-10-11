import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { LuckyWord } from '../../types/content';
import { Sparkles, X } from 'lucide-react';

export const Page5LuckyActually: React.FC = () => {
  const { content } = useContent();
  const { lucky } = content;
  const visibleLucky = lucky.filter((l) => !l.hidden);
  const [activeWord, setActiveWord] = useState<LuckyWord | null>(null);

  return (
    <section
      id="page-5"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#A9B89A] text-[#2F3F2A] overflow-hidden transition-colors duration-700 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2 z-10">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#4E6045] block">
          page 05 · gratitude garden
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#2F3F2A]">
          LUCKY, ACTUALLY
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#4E6045] max-w-md mx-auto">
          "Quiet gifts that I didn't earn, but receive every single morning. Hover any word."
        </p>
      </div>

      {/* Floating Words Field (Asymmetric Garden Layout) */}
      <div className="max-w-5xl mx-auto my-12 w-full flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-8 z-10">
        {visibleLucky.map((item, idx) => {
          const isSelected = activeWord?.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveWord(item)}
              onMouseEnter={() => setActiveWord(item)}
              className={`font-serif italic text-3xl sm:text-5xl lg:text-6xl transition-all duration-300 transform hover:scale-110 cursor-pointer ${
                isSelected
                  ? 'text-[#2F3F2A] bg-[#F0CF65] px-4 py-1 rounded-xl shadow-md rotate-[-2deg]'
                  : 'text-[#2F3F2A]/75 hover:text-[#2F3F2A]'
              }`}
              style={{
                marginTop: `${(idx % 3) * 16}px`,
              }}
            >
              {item.word}
            </button>
          );
        })}
      </div>

      {/* Detail Memory Display Card */}
      <div className="max-w-2xl mx-auto w-full z-10 min-h-[140px]">
        {activeWord ? (
          <div className="bg-[#F5F0DF] p-6 rounded-2xl border border-[#2F3F2A]/15 shadow-xl animate-fadeIn flex flex-col sm:flex-row items-center gap-6">
            {activeWord.photo && (
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-[#2F3F2A]/20 bg-white">
                <img
                  src={activeWord.photo.file}
                  alt={activeWord.photo.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#4E6045]">
                Gratitude Anchor · {activeWord.word}
              </span>
              <p className="font-sans text-sm sm:text-base text-[#2F3F2A] font-medium leading-relaxed">
                "{activeWord.memory}"
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs font-mono text-[#4E6045]">
            [hover or click any word above to discover the memory]
          </div>
        )}
      </div>

    </section>
  );
};
