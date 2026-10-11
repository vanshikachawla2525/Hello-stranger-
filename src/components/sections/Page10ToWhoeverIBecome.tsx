import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { LetterItem, VisitorLetter } from '../../types/content';
import { Mail, Send, X, Star, Sparkles } from 'lucide-react';

export const Page10ToWhoeverIBecome: React.FC = () => {
  const { content, isPreviewMode } = useContent();
  const { letters } = content;
  const visibleLetters = letters.filter((l) => (l.approved !== false || isPreviewMode) && !l.hidden);

  const [activeEnvelope, setActiveEnvelope] = useState<LetterItem | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorMessage, setVisitorMessage] = useState('');
  const [visitorLetters, setVisitorLetters] = useState<VisitorLetter[]>([]);
  const [formSuccess, setFormSuccess] = useState(false);

  // Load visitor letters from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hs:letters:v1');
      if (saved) {
        setVisitorLetters(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorMessage.trim()) return;

    const newLetter: VisitorLetter = {
      id: Date.now().toString(),
      author: visitorName.trim() || 'A fellow stranger',
      message: visitorMessage.trim(),
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updated = [newLetter, ...visitorLetters].slice(0, 50);
    setVisitorLetters(updated);
    try {
      localStorage.setItem('hs:letters:v1', JSON.stringify(updated));
    } catch {}

    setVisitorName('');
    setVisitorMessage('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <section
      id="page-10"
      className="relative min-h-screen w-full py-24 px-4 sm:px-8 lg:px-16 bg-[#2A1812] text-[#E9D9B8] overflow-hidden transition-colors duration-700"
    >
      {/* Warm Radial Candlelight over table */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#E9D9B8]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-2 mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#B49E7C] block">
          page 10 · wax-sealed table
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl italic tracking-tight text-[#E9D9B8]">
          TO WHOEVER I BECOME
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#B49E7C] max-w-md mx-auto">
          "Four letters sealed with burgundy wax for the future self, waiting to be unsealed."
        </p>
      </div>

      {/* The Dark Chocolate Table with Wax-Sealed Envelopes */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-20">
        {visibleLetters.map((letItem, idx) => (
          <div
            key={letItem.id}
            onClick={() => setActiveEnvelope(letItem)}
            className="group relative bg-[#3A241B] rounded-2xl p-6 border border-[#B49E7C]/20 shadow-2xl cursor-pointer hover:border-[#7A2230] transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between h-72"
            style={{ transform: `rotate(${((idx % 4) - 1.5) * 2}deg)` }}
          >
            {/* Envelope Flap Lines */}
            <div className="absolute top-0 inset-x-0 h-24 border-b border-[#B49E7C]/15 pointer-events-none" />

            {/* The Burgundy Wax Seal in center */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#7A2230] border-2 border-[#54141E] shadow-xl flex items-center justify-center text-amber-200 transition-transform duration-300 group-hover:scale-110">
              <Star className="w-5 h-5 fill-current" />
            </div>

            <div className="pt-2 text-right">
              <span className="text-[10px] font-mono text-[#B49E7C] uppercase tracking-widest">
                LETTER 0{idx + 1}
              </span>
            </div>

            <div className="space-y-1 text-center pt-8">
              <h3 className="font-serif text-xl sm:text-2xl text-[#E9D9B8] group-hover:text-white transition-colors">
                {letItem.title}
              </h3>
              <p className="text-xs font-handwriting text-[#B49E7C] text-lg">
                "{letItem.notes}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#B49E7C]/10 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#B49E7C] group-hover:text-amber-200">
                [click to break seal]
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Visitor Letter Form & Desk Slips (Section 5.7 & 10) */}
      <div className="relative z-10 max-w-3xl mx-auto bg-[#3A241B]/90 rounded-3xl p-8 sm:p-12 border border-[#B49E7C]/20 shadow-2xl space-y-8">
        <div className="border-b border-[#B49E7C]/15 pb-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B49E7C] block mb-1">
            The Guestbook · Device Local Storage
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl italic text-[#E9D9B8]">
            Leave a Note for Vanshika
          </h3>
          <p className="text-xs text-[#B49E7C] mt-1">
            "Your message is preserved gently on this device only."
          </p>
        </div>

        <form onSubmit={handleVisitorSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#B49E7C] font-mono mb-1">
              Sign it or don't (Optional name)
            </label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Your name or initial..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#2A1812] border border-[#B49E7C]/20 text-sm text-[#E9D9B8] placeholder:text-[#B49E7C]/40 focus:outline-none focus:border-[#7A2230]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#B49E7C] font-mono mb-1">
              Your note or quiet thought
            </label>
            <textarea
              rows={4}
              value={visitorMessage}
              onChange={(e) => setVisitorMessage(e.target.value)}
              placeholder="What made you pause today? Write here..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#2A1812] border border-[#B49E7C]/20 text-sm font-handwriting text-xl text-[#E9D9B8] placeholder:text-[#B49E7C]/40 focus:outline-none focus:border-[#7A2230] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {formSuccess ? (
              <span className="text-xs font-mono text-emerald-400">
                it's kept. only on this device, only for you.
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#B49E7C]">
                Safe & private local storage
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7A2230] text-white text-xs font-medium tracking-wide hover:opacity-90 transition-opacity shadow-md"
            >
              <span>leave it here</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Existing Visitor Slips */}
        {visitorLetters.length > 0 && (
          <div className="pt-6 border-t border-[#B49E7C]/15 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#B49E7C] block">
              Saved Notes on this Desk ({visitorLetters.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {visitorLetters.map((vl) => (
                <div
                  key={vl.id}
                  className="p-3 bg-[#E9D9B8] text-[#2A1812] rounded-lg shadow-sm border border-[#C9B590] relative"
                >
                  <p className="font-handwriting text-lg leading-snug">
                    "{vl.message}"
                  </p>
                  <div className="mt-2 text-right text-[10px] font-mono text-[#7A2230] font-semibold">
                    — {vl.author} · {vl.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Envelope Opened Modal Sheet (Writing animation) */}
      {activeEnvelope && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveEnvelope(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#E9D9B8] text-[#2A1812] rounded-2xl p-8 sm:p-12 shadow-2xl border border-[#C9B590] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveEnvelope(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-[#2A1812]" />
            </button>

            <div className="border-b border-[#2A1812]/15 pb-4 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A2230] font-bold block mb-1">
                SEAL CRACKED · ARCHIVAL LETTER
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#2A1812]">
                {activeEnvelope.title}
              </h3>
              {activeEnvelope.date && (
                <span className="text-xs font-mono text-[#7C6A58] block mt-1">
                  Inscribed: {activeEnvelope.date}
                </span>
              )}
            </div>

            <div className="font-handwriting text-2xl sm:text-3xl text-[#2A1812] leading-relaxed py-2">
              <p>"{activeEnvelope.body}"</p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#2A1812]/15 flex items-center justify-between text-xs font-mono text-[#7C6A58]">
              <span>Signed, Vanshika Chawla</span>
              <button
                onClick={() => setActiveEnvelope(null)}
                className="text-[#7A2230] font-bold hover:underline"
              >
                close letter
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
