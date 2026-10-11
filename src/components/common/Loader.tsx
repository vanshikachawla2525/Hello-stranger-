import React, { useState, useEffect } from 'react';

export const Loader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const [visible, setVisible] = useState(true);

  // Story-driven lines from brief
  const lines = [
    { max: 25, text: "developing the photographs" },
    { max: 50, text: "finding the good light" },
    { max: 75, text: "putting things back in order" },
    { max: 100, text: "almost ready to be looked at" },
  ];

  const currentLine = lines.find((l) => progress <= l.max)?.text || lines[lines.length - 1].text;
  const frameNumber = Math.min(36, Math.max(1, Math.floor((progress / 100) * 36)));

  useEffect(() => {
    // Check if user already saw loader this session to allow immediate entry if desired,
    // but on first load let's give the authentic experience
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsSplitting(true);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 850);
        return () => clearTimeout(hideTimer);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-auto overflow-hidden font-sans select-none">
      {/* Left Door */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-[#EFE8DA] transition-transform duration-800 ease-[cubic-bezier(0.7,0,0.2,1)]"
        style={{
          width: '38%',
          transform: isSplitting ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Film counter bottom left */}
        <div className="absolute bottom-8 left-8 text-xs font-mono text-[#7A7064] tracking-wider uppercase">
          frame {String(frameNumber).padStart(2, '0')} / 36
        </div>
      </div>

      {/* Right Door */}
      <div
        className="absolute top-0 bottom-0 right-0 bg-[#EFE8DA] transition-transform duration-800 ease-[cubic-bezier(0.7,0,0.2,1)]"
        style={{
          width: '62%',
          transform: isSplitting ? 'translateX(100%)' : 'translateX(0)',
        }}
      >
        <button
          onClick={() => {
            setIsSplitting(true);
            setTimeout(() => {
              setVisible(false);
              onComplete();
            }, 500);
          }}
          className="absolute top-8 right-8 text-xs tracking-widest uppercase text-[#7A7064] hover:text-[#1B1713] transition-colors"
        >
          skip [esc]
        </button>
      </div>

      {/* Center Seam Line with 1px tag (aligned at 38%) */}
      <div
        className={`absolute top-0 bottom-0 pointer-events-none transition-opacity duration-300 ${
          isSplitting ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ left: '38%' }}
      >
        {/* The 1px line growing downward */}
        <div
          className="w-[1px] bg-[#1B1713]/40 origin-top transition-all duration-75"
          style={{ height: `${progress}%` }}
        />
        {/* Tiny "1px" tag riding the line tip */}
        <div
          className="absolute -left-3 text-[10px] font-mono text-[#7A7064] transition-all duration-75"
          style={{ top: `${Math.min(94, Math.max(3, progress))}%` }}
        >
          1px
        </div>
      </div>

      {/* Rolling text in center */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-400 ${
          isSplitting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Mask container */}
        <div className="h-14 overflow-hidden flex items-center justify-center text-center px-4">
          <div
            key={currentLine}
            className="animate-slideUp font-serif italic text-2xl sm:text-3xl text-[#1B1713] tracking-wide"
          >
            {currentLine}
          </div>
        </div>

        {/* Circular spinner cursor */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#1B1713]/20 border-t-[#B3342B] rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-[#7A7064]">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
