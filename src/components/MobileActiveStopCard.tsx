import React from 'react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Navigation, 
  Dices, 
  ListOrdered,
  Sparkles,
  MapPin,
  Footprints
} from 'lucide-react';
import { TourStop, Language, Bar } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface MobileActiveStopCardProps {
  tourStops: TourStop[];
  allBars: Bar[];
  selectedBarId: string | null;
  onSelectBar: (barId: string) => void;
  onToggleComplete: (stopId: string) => void;
  onReRollChallenge: (stopIndex: number) => void;
  onQuickGenerate: () => void;
  onOpenPlanner: () => void;
  onViewFullTour: () => void;
  lang: Language;
}

export const MobileActiveStopCard: React.FC<MobileActiveStopCardProps> = ({
  tourStops,
  selectedBarId,
  onSelectBar,
  onToggleComplete,
  onReRollChallenge,
  onQuickGenerate,
  onOpenPlanner,
  onViewFullTour,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  if (tourStops.length === 0) {
    return (
      <div className="md:hidden absolute bottom-16 left-3 right-3 z-30 bg-[#0F0F0F]/95 backdrop-blur-xl border border-[#FDD835]/30 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍻</span>
            <div>
              <h3 className="text-sm font-black text-[#FDD835] uppercase tracking-tight">
                {t.emptyMsg}
              </h3>
              <p className="text-[11px] text-white/50">{t.emptyDesc}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onQuickGenerate}
            className="flex-1 py-2.5 px-3 bg-[#FDD835] text-[#111111] font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#FDD835]/20 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 fill-[#111111]" />
            <span>{t.btnGen}</span>
          </button>
          <button
            type="button"
            onClick={onOpenPlanner}
            className="py-2.5 px-3 bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider border border-white/10 active:scale-95 cursor-pointer min-h-[44px]"
          >
            {t.btnCustomGen}
          </button>
        </div>
      </div>
    );
  }

  // Find index of currently selected stop, or fallback to first uncompleted stop, or 0
  let activeIndex = tourStops.findIndex((s) => s.bar.id === selectedBarId);
  if (activeIndex === -1) {
    const uncompletedIndex = tourStops.findIndex((s) => !s.completed);
    activeIndex = uncompletedIndex !== -1 ? uncompletedIndex : 0;
  }

  const currentStop = tourStops[activeIndex];
  const bar = currentStop.bar;
  const isDone = currentStop.completed;
  const priceStr = '€'.repeat(bar.priceLevel);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${bar.name}, ${bar.street}, Budapest`
  )}`;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = activeIndex > 0 ? activeIndex - 1 : tourStops.length - 1;
    onSelectBar(tourStops[prevIdx].bar.id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = activeIndex < tourStops.length - 1 ? activeIndex + 1 : 0;
    onSelectBar(tourStops[nextIdx].bar.id);
  };

  const handleCheckInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(currentStop.id);
    if (!isDone) {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#FDD835', '#FBC02D', '#FFA000', '#10B981', '#FFFFFF'],
      });
    }
  };

  return (
    <div className="md:hidden absolute bottom-[4.5rem] left-3 right-3 z-30 bg-[#0F0F0F]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Top Controls & Stop Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isDone
                ? 'bg-emerald-500 text-[#111111]'
                : 'bg-[#FDD835] text-[#111111]'
            }`}
          >
            #{activeIndex + 1} / {tourStops.length}
          </span>
          <span className="text-[11px] font-bold text-white/50 truncate">
            {bar.district}
          </span>
        </div>

        {/* Step Prev/Next Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title={t.prevStop}
            aria-label="Previous stop"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title={t.nextStop}
            aria-label="Next stop"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bar Name & Address */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`font-black text-base leading-tight truncate ${
              isDone ? 'line-through text-white/50' : 'text-[#FDD835]'
            }`}
          >
            {bar.name}
          </h4>
          <span className="text-xs font-bold text-white/40">{priceStr}</span>
        </div>
        <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-[#FDD835] shrink-0" />
          <span className="truncate">{bar.street}</span>
        </p>
      </div>

      {/* Challenge Callout Box */}
      <div className="bg-black/50 border-l-2 border-[#FDD835] p-2 rounded-r-lg mb-3">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[9px] uppercase font-black tracking-widest text-[#FDD835]">
            🎯 {t.challengeTitle}
          </span>
          <button
            type="button"
            onClick={() => onReRollChallenge(activeIndex)}
            className="text-[9px] text-white/40 hover:text-[#FDD835] flex items-center gap-1 uppercase font-bold px-1.5 py-0.5 bg-white/5 rounded cursor-pointer"
            title={t.reRollChallenge}
          >
            <Dices className="w-2.5 h-2.5" />
            <span>{lang === 'hu' ? 'Új' : 'New'}</span>
          </button>
        </div>
        <p className="text-[11px] italic text-white/90 leading-tight">
          "{lang === 'hu' ? currentStop.challengeHu : currentStop.challengeEn}"
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Check in button */}
        <button
          type="button"
          onClick={handleCheckInClick}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[44px] shadow-md ${
            isDone
              ? 'bg-emerald-500 text-[#111111] shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-[#FDD835] text-[#111111] shadow-[0_0_12px_rgba(253,216,53,0.3)] hover:bg-[#FDD835]/90'
          }`}
        >
          {isDone ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.checkInDone}</span>
            </>
          ) : (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-[#111111] flex items-center justify-center text-[10px] font-black">
                {activeIndex + 1}
              </span>
              <span>{lang === 'hu' ? 'Megérkeztem!' : 'Check In'}</span>
            </>
          )}
        </button>

        {/* Google Maps Nav */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px]"
          title={t.openInMaps}
        >
          <Navigation className="w-3.5 h-3.5 text-[#FDD835]" />
          <span>{t.openInMaps}</span>
        </a>

        {/* View Full Itinerary */}
        <button
          type="button"
          onClick={onViewFullTour}
          className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl transition-colors active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          title={t.viewFullTour}
          aria-label={t.viewFullTour}
        >
          <ListOrdered className="w-4 h-4 text-[#FDD835]" />
        </button>
      </div>
    </div>
  );
};
