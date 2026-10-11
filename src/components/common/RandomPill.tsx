import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { X, Shuffle, Sparkles } from 'lucide-react';

type RandomCard = {
  id: string;
  type: string;
  title: string;
  content: string;
  tag: string;
  photo?: string;
};

export const RandomPill: React.FC = () => {
  const { content } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentCard, setCurrentCard] = useState<RandomCard | null>(null);
  const [lastId, setLastId] = useState<string>('');

  const buildPool = (): RandomCard[] => {
    const pool: RandomCard[] = [];

    // Four words
    content.identity.fourWords.forEach((fw) => {
      pool.push({
        id: `fw-${fw.word}`,
        type: 'Touchstone Word',
        title: fw.word,
        content: fw.meaning,
        tag: 'Identity',
      });
    });

    // Polaroids
    content.noBigDeal.polaroids.forEach((p) => {
      pool.push({
        id: p.id,
        type: 'Polaroid Moment',
        title: p.caption,
        content: p.note || p.photo.caption || '',
        tag: 'Scrapbook',
        photo: p.photo.file,
      });
    });

    // Drafts
    content.drafts.entries.forEach((d) => {
      pool.push({
        id: d.id,
        type: 'Journal Draft',
        title: d.title || d.date,
        content: d.pullQuote || d.text.slice(0, 160) + '...',
        tag: 'From the Drafts',
        photo: d.photo?.file,
      });
    });

    // Inside Jokes
    content.noBigDeal.insideJokes.forEach((joke, idx) => {
      pool.push({
        id: `joke-${idx}`,
        type: 'Inside Joke',
        title: 'Heard in Passing',
        content: `"${joke}"`,
        tag: 'No Big Deal',
      });
    });

    // Proud
    content.proud.forEach((pr) => {
      pool.push({
        id: pr.id,
        type: 'Milestone',
        title: pr.title,
        content: pr.story,
        tag: 'Look How Far',
        photo: pr.photo.file,
      });
    });

    // Dreams
    content.dreams.forEach((dr) => {
      pool.push({
        id: dr.id,
        type: 'Dream Horizon',
        title: dr.place,
        content: dr.why,
        tag: 'One Day',
        photo: dr.photo.file,
      });
    });

    // Childhood
    content.childhood.photos.forEach((cp) => {
      pool.push({
        id: cp.id,
        type: 'Archive Film Frame',
        title: `Year ${cp.year}`,
        content: cp.caption,
        tag: 'Before I Knew',
        photo: cp.photo.file,
      });
    });

    return pool;
  };

  const pickRandom = () => {
    setIsShuffling(true);
    const pool = buildPool();
    const available = pool.filter((c) => c.id !== lastId);
    const selected = (available.length > 0 ? available : pool)[
      Math.floor(Math.random() * (available.length > 0 ? available.length : pool.length))
    ];

    setTimeout(() => {
      setCurrentCard(selected);
      setLastId(selected.id);
      setIsShuffling(false);
    }, 450);
  };

  const handleOpen = () => {
    setIsOpen(true);
    pickRandom();
  };

  return (
    <>
      {/* Floating Pill with warm peach-to-rose gradient permitted in 5.10 */}
      <div className="fixed bottom-6 right-20 sm:right-28 z-40 pointer-events-auto">
        <button
          onClick={handleOpen}
          className="group flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#1B1713]/25 bg-white text-[#1B1713] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95 text-xs font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#FAD0C4] hover:to-[#FFD1FF]"
        >
          <span className="text-[#B3342B] text-xs">✦</span>
          <span>random me</span>
        </button>
      </div>

      {/* Modal Card Display */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FBF9F5] text-[#1B1713] rounded-2xl border border-[#1B1713]/15 shadow-2xl p-6 sm:p-8 animate-scaleUp overflow-hidden">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1B1713]/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A7064]">
                {currentCard?.tag || 'Random Memory'}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#1B1713]/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#1B1713]" />
              </button>
            </div>

            {/* Content Area */}
            <div className="py-6 min-h-[220px] flex flex-col justify-center">
              {isShuffling ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-[#B3342B] border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-[#7A7064]">shuffling memory cards...</span>
                </div>
              ) : currentCard ? (
                <div className="space-y-4">
                  {currentCard.photo && (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-[#1B1713]/15 bg-[#EFE8DA]">
                      <img
                        src={currentCard.photo}
                        alt={currentCard.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#B3342B]">
                      {currentCard.type}
                    </span>
                    <h3 className="font-serif text-2xl font-bold italic mt-0.5 text-[#1B1713]">
                      {currentCard.title}
                    </h3>
                  </div>

                  <p className="text-sm font-sans text-[#2A1E18] leading-relaxed">
                    {currentCard.content}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1B1713]/10">
              <button
                onClick={pickRandom}
                disabled={isShuffling}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1B1713] text-white hover:bg-[#1B1713]/85 transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>another memory</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#7A7064] hover:text-[#1B1713] transition-colors"
              >
                close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
