import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Dices, Sparkles, Plus, MapPin } from 'lucide-react';
import { Bar, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBars: Bar[];
  onAddWinnerToTour: (bar: Bar) => void;
  onSelectOnMap: (barId: string) => void;
  lang: Language;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  allBars,
  onAddWinnerToTour,
  onSelectOnMap,
  lang,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedBar, setDisplayedBar] = useState<Bar | null>(null);
  const [winnerBar, setWinnerBar] = useState<Bar | null>(null);
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinnerBar(null);

    let counter = 0;
    const totalSteps = 24;
    const intervalTime = 75;

    const interval = setInterval(() => {
      const randomBar = allBars[Math.floor(Math.random() * allBars.length)];
      setDisplayedBar(randomBar);
      counter++;

      if (counter >= totalSteps) {
        clearInterval(interval);
        const finalWinner = allBars[Math.floor(Math.random() * allBars.length)];
        setDisplayedBar(finalWinner);
        setWinnerBar(finalWinner);
        setIsSpinning(false);

        // Festive confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FDD835', '#FFA000', '#10B981', '#38BDF8', '#FFFFFF'],
        });
      }
    }, intervalTime);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
          <div>
            <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold block mb-0.5">
              {t.rouletteSubtitle}
            </span>
            <h3 className="font-black text-lg text-[#FDD835] tracking-tight">{t.rouletteTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <p className="text-xs text-white/50 mb-6 max-w-xs">{t.rouletteDesc}</p>

          {/* Slot Machine Display Box */}
          <div className="w-full bg-[#121212] border border-[#FDD835]/30 rounded-2xl p-5 mb-6 min-h-[140px] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            {displayedBar ? (
              <div className={`transition-all ${isSpinning ? 'scale-95 opacity-80 blur-[0.5px]' : 'scale-100 opacity-100'}`}>
                <div className="text-3xl mb-1">🍻</div>
                <h4 className="font-black text-lg text-[#FDD835] leading-tight mb-1">
                  {displayedBar.name}
                </h4>
                <p className="text-[11px] text-white/50 flex items-center justify-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-white/40" />
                  <span>{displayedBar.street}</span>
                </p>
                <div className="text-xs text-white/70 line-clamp-2 px-2 text-[11px]">
                  {lang === 'hu' ? displayedBar.descriptionHu : displayedBar.descriptionEn}
                </div>
              </div>
            ) : (
              <div className="text-white/30 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-2">
                <span className="text-3xl">🎰</span>
                <span>{t.spinReveal}</span>
              </div>
            )}
          </div>

          {/* Action Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 bg-[#FDD835] hover:bg-[#FDD835]/90 disabled:opacity-50 text-[#111111] font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FDD835]/20 active:scale-98 transition-all mb-3 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-[#111111]" />
            <span>{isSpinning ? t.spinning : t.spinBtn}</span>
          </button>

          {/* Winner Actions */}
          {winnerBar && (
            <div className="w-full flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 mt-2">
              <button
                onClick={() => {
                  onAddWinnerToTour(winnerBar);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 bg-white/10 hover:bg-[#FDD835] hover:text-[#111111] text-[#FDD835] font-bold uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#FDD835]/40 active:scale-95 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addToTour}</span>
              </button>

              <button
                onClick={() => {
                  onSelectOnMap(winnerBar.id);
                  onClose();
                }}
                className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider rounded-xl text-xs transition-colors border border-white/5 cursor-pointer"
              >
                {t.viewOnMap}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
