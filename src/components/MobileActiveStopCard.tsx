import React, { useState } from 'react';
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
  Footprints,
  ExternalLink,
  X
} from 'lucide-react';
import { TourStop, Language, Bar } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { getGoogleMapsWalkingUrl, getAppleMapsWalkingUrl, isAppleDevice } from '../utils/mapLinks';

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
  const isApple = isAppleDevice();
  const googleMapsUrl = getGoogleMapsWalkingUrl(bar.name, bar.street, bar.coords);
  const appleMapsUrl = getAppleMapsWalkingUrl(bar.name, bar.street, bar.coords);

  const [showNavOptions, setShowNavOptions] = useState(false);

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
      {/* Navigation App Chooser Popover */}
      {showNavOptions && (
        <div className="absolute -top-32 left-0 right-0 bg-[#161616] border border-[#FDD835]/40 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FDD835] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              {lang === 'hu' ? 'Navigáció indítása' : 'Start Navigation'}
            </span>
            <button
              onClick={() => setShowNavOptions(false)}
              className="p-1 text-white/50 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowNavOptions(false)}
              className="flex flex-col items-center justify-center py-2.5 px-2 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 text-center"
            >
              <span className="flex items-center gap-1">
                🗺️ Google Maps
              </span>
              <span className="text-[10px] text-[#111111]/70 font-semibold">{lang === 'hu' ? 'Gyalogos útiterv' : 'Walking route'}</span>
            </a>

            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowNavOptions(false)}
              className="flex flex-col items-center justify-center py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white font-black text-xs rounded-xl border border-white/15 transition-transform active:scale-95 text-center"
            >
              <span className="flex items-center gap-1">
                🍏 Apple Térkép
              </span>
              <span className="text-[10px] text-white/60 font-semibold">{lang === 'hu' ? 'iOS Térképek' : 'Apple Maps iOS'}</span>
            </a>
          </div>
        </div>
      )}

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

        {/* Step Prev/Next & Quick Re-generate Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickGenerate();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#FDD835]/15 hover:bg-[#FDD835]/25 text-[#FDD835] border border-[#FDD835]/30 rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 cursor-pointer min-h-[34px]"
            title={lang === 'hu' ? 'Új túra generálása azonnal' : 'Generate new tour instantly'}
          >
            <Sparkles className="w-3 h-3 fill-[#FDD835]" />
            <span>{lang === 'hu' ? 'Új túra' : 'New'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center border border-white/5"
            title={t.prevStop}
            aria-label="Previous stop"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center border border-white/5"
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

        {/* Navigation App Trigger (Opens Google Maps / Apple Maps chooser) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowNavOptions(!showNavOptions);
          }}
          className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px] cursor-pointer"
          title={t.openInMaps}
        >
          <Navigation className="w-3.5 h-3.5 text-[#FDD835]" />
          <span>{t.openInMaps}</span>
        </button>

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
