import React from 'react';

export const Seam: React.FC<{ scrollPercentage?: number }> = () => {
  return (
    <div
      className="fixed top-0 bottom-0 pointer-events-none z-30 hidden md:block"
      style={{ left: 'var(--seam-pos, 38%)' }}
    >
      {/* 1px Vertical Line */}
      <div className="w-[1px] h-full bg-[var(--line)] transition-colors duration-700 relative">
        {/* Tiny 1px label pinned near top */}
        <div className="absolute top-6 -left-3 text-[9px] font-mono tracking-tighter text-[var(--muted)] select-none">
          1px
        </div>
      </div>
    </div>
  );
};
