import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export const Page2FromTheDrafts: React.FC = () => {
  const { content, marginaliaEnabled } = useContent();
  const { drafts } = content;
  const [activeEntryIdx, setActiveEntryIdx] = useState(0);

  const entries = drafts.entries.filter((e) => !e.hidden);
  const current = entries[activeEntryIdx] || entries[0];

  const handleNext = () => {
    setActiveEntryIdx((prev) => (prev + 1) % entries.length);
  };

  const handlePrev = () => {
    setActiveEntryIdx((prev) => (prev - 1 + entries.length) % entries.length);
  };

  return (
    <section
      id="page-2"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#F6F0E4] text-[#3A3834] transition-colors duration-700"
    >
      {/* Edge Arrow Navigation Controls (Matching Reference Video!) */}
      <button
        onClick={handlePrev}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-[#3A3834]/20 bg-[#F6F0E4]/80 backdrop-blur-xs flex items-center justify-center text-[#3A3834] hover:bg-[#3A3834] hover:text-[#F6F0E4] transition-colors shadow-sm hidden md:flex"
        title="Previous draft entry"
        aria-label="Previous draft entry"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-[#3A3834]/20 bg-[#F6F0E4]/80 backdrop-blur-xs flex items-center justify-center text-[#3A3834] hover:bg-[#3A3834] hover:text-[#F6F0E4] transition-colors shadow-sm hidden md:flex"
        title="Next draft entry"
        aria-label="Next draft entry"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Header Centered Small Caps */}
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-2">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#8A7B6C] block">
          page 02 · confidential archives
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#3A3834]">
          FROM THE DRAFTS
        </h2>
        <div className="w-12 h-[1px] bg-[#6B5444]/30 mx-auto mt-4" />
      </div>

      {/* Essay Column Layout (7 of 12 columns offset right of seam) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Index & Margin Notes */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <div className="p-5 bg-white/60 rounded-xl border border-[#3A3834]/10 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A7B6C] block">
              entry {activeEntryIdx + 1} of {entries.length}
            </span>

            <div className="flex flex-col gap-2">
              {entries.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveEntryIdx(idx)}
                  className={`text-left text-xs py-1.5 px-2.5 rounded transition-colors flex items-center justify-between ${
                    activeEntryIdx === idx
                      ? 'bg-[#6B5444] text-[#F6F0E4] font-medium'
                      : 'text-[#8A7B6C] hover:text-[#3A3834] hover:bg-[#3A3834]/5'
                  }`}
                >
                  <span className="truncate">{item.title || item.date}</span>
                  <span className="font-mono text-[10px] opacity-75">{item.date}</span>
                </button>
              ))}
            </div>
          </div>

          {current.marginNote && (
            <div className="p-4 bg-white/40 rounded-xl border border-[#3A3834]/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A7B6C] block mb-1">
                marginal note
              </span>
              <p className="font-handwriting text-xl text-[#6B5444] leading-snug">
                "{current.marginNote}"
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Illuminated Reading Essay */}
        <div className="lg:col-span-8 bg-white/80 p-8 sm:p-12 rounded-2xl border border-[#3A3834]/10 shadow-sm space-y-8">
          
          <div className="border-b border-[#3A3834]/10 pb-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8A7B6C]">
              {current.date}
            </span>
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={handlePrev}
                className="p-1 rounded border border-[#3A3834]/20 hover:bg-[#3A3834]/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded border border-[#3A3834]/20 hover:bg-[#3A3834]/5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl text-[#3A3834] leading-tight">
            {current.title}
          </h3>

          {/* Illuminated Reading Prose */}
          <div className="prose prose-lg text-[#3A3834] leading-relaxed font-sans text-base sm:text-lg">
            <p className="transition-opacity duration-500">
              {current.text}
            </p>
          </div>

          {/* Pull Quote */}
          {current.pullQuote && (
            <blockquote className="my-8 py-4 px-6 border-l-2 border-[#6B5444] bg-[#F6F0E4]/60 rounded-r-lg">
              <p className="font-serif italic text-xl sm:text-2xl text-[#3A3834] leading-snug">
                "{current.pullQuote}"
              </p>
            </blockquote>
          )}

          {/* Floating Editorial Photo */}
          {current.photo && (
            <div className="my-8 rounded-xl overflow-hidden border border-[#3A3834]/15 shadow-md bg-[#EFE8DA]">
              <img
                src={current.photo.file}
                alt={current.photo.alt}
                className="w-full h-80 object-cover"
              />
              {current.photo.caption && (
                <div className="p-3 bg-white/90 text-[11px] font-mono text-[#8A7B6C]">
                  {current.photo.caption}
                </div>
              )}
            </div>
          )}

          {/* Bottom Section Link */}
          <div className="pt-8 border-t border-[#3A3834]/10 flex items-center justify-between">
            <span className="text-xs font-mono text-[#8A7B6C]">
              Next chapter: Before I Knew (Family Archive)
            </span>
            <a
              href="#page-3"
              className="text-xs font-mono uppercase tracking-wider text-[#6B5444] hover:underline flex items-center gap-1 font-bold"
            >
              <span>go to film strip</span>
              <span>→</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
