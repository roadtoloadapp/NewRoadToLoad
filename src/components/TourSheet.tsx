import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Beer, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw, 
  Copy, 
  Footprints, 
  Sparkles, 
  Dices, 
  ExternalLink,
  MessageSquare,
  Minimize2,
  Maximize2,
  ChevronRight,
  Trophy,
  Check
} from 'lucide-react';
import { TourStop, Language, Bar } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  calculateTourStats, 
  formatTourShareText, 
  generateGoogleMapsRouteUrl 
} from '../utils/geo';

interface TourSheetProps {
  tourStops: TourStop[];
  allBars: Bar[];
  lang: Language;
  selectedBarId: string | null;
  onSelectBar: (barId: string) => void;
  onToggleComplete: (stopId: string) => void;
  onReRollBar: (stopIndex: number) => void;
  onReRollChallenge: (stopIndex: number) => void;
  onMoveStop: (fromIndex: number, toIndex: number) => void;
  onQuickGenerate: () => void;
  onOpenPlanner: () => void;
  isMobileView?: boolean;
}

export const TourSheet: React.FC<TourSheetProps> = ({
  tourStops,
  lang,
  selectedBarId,
  onSelectBar,
  onToggleComplete,
  onReRollBar,
  onReRollChallenge,
  onMoveStop,
  onQuickGenerate,
  onOpenPlanner,
  isMobileView = false,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];
  const { totalDistanceMeters, totalWalkMinutes } = calculateTourStats(tourStops);
  const completedCount = tourStops.filter((s) => s.completed).length;
  const isTourFullyFinished = tourStops.length > 0 && completedCount === tourStops.length;

  const handleCheckIn = (stop: TourStop) => {
    onToggleComplete(stop.id);
    if (!stop.completed) {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#FDD835', '#FBC02D', '#FFA000', '#10B981', '#FFFFFF']
      });
    }
  };

  const handleCopy = () => {
    const text = formatTourShareText(tourStops, lang);
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = formatTourShareText(tourStops, lang);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const formattedDistance =
    totalDistanceMeters >= 1000
      ? `${(totalDistanceMeters / 1000).toFixed(1)} ${t.km}`
      : `${totalDistanceMeters} ${t.meters}`;

  if (tourStops.length === 0) {
    return (
      <div className={`${
        isMobileView
          ? 'fixed inset-x-3 top-20 z-40 max-w-lg mx-auto'
          : 'hidden sm:block absolute top-20 right-4 z-40 w-[calc(100vw-2rem)] sm:w-[340px]'
      } bg-[#0F0F0F]/95 backdrop-blur-xl border border-[#FDD835]/30 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#FDD835]/10 border border-[#FDD835]/30 flex items-center justify-center mb-3 text-[#FDD835]">
            <Beer className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#FDD835] uppercase tracking-tight mb-1">{t.emptyMsg}</h3>
          <p className="text-xs text-white/50 mb-4 max-w-xs">{t.emptyDesc}</p>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={onQuickGenerate}
              className="flex-1 py-3 px-4 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FDD835]/20 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 fill-[#111111]" />
              <span>{t.btnGen}</span>
            </button>
            <button
              onClick={onOpenPlanner}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 text-[#EEEEEE] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              {t.btnCustomGen}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isMobileView
          ? 'fixed inset-x-2 top-16 bottom-16 z-40 flex flex-col justify-end'
          : `hidden sm:block absolute z-40 transition-all duration-300 ease-out shadow-2xl sm:top-20 sm:right-4 sm:w-[350px] lg:w-[380px] max-h-[82vh] ${
              isMinimized ? 'w-auto' : ''
            }`
      }
    >
      <div className="bg-[#0F0F0F]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[calc(100vh-8.5rem)] sm:max-h-[82vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-[#0A0A0A]/80">
          <div>
            <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold block mb-0.5">
              {t.itinerary} • {tourStops.length} {t.stopsCount}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#FDD835] tracking-tight">
              {t.listTitle}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-white/50 mt-0.5 font-medium">
              <Footprints className="w-3 h-3 text-[#FDD835]" />
              <span>{formattedDistance} • ~{totalWalkMinutes} {t.mins}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onQuickGenerate}
              className="p-2 sm:p-2 bg-white/5 hover:bg-white/10 text-[#FDD835] border border-white/5 rounded-xl transition-colors text-xs font-bold cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title={t.btnGen}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {!isMobileView && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 rounded-xl transition-colors text-xs font-bold cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Minimized View Pill (Desktop only) */}
        {!isMobileView && isMinimized ? (
          <div 
            onClick={() => setIsMinimized(false)}
            className="p-3 bg-[#0A0A0A] cursor-pointer flex items-center gap-2 hover:bg-[#1A1A1A] transition-colors border-t border-white/5"
          >
            <div className="text-xs font-black uppercase tracking-wider text-[#FDD835]">
              {completedCount}/{tourStops.length} {lang === 'hu' ? 'Kész' : 'Done'}
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </div>
        ) : (
          <>
            {/* Progress Bar & Milestone Status */}
            <div className="px-4 sm:px-5 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#FDD835] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(253,216,53,0.6)]"
                    style={{ width: `${(completedCount / tourStops.length) * 100}%` }}
                  />
                </div>
                <span className="font-extrabold text-[11px] text-white/60 tracking-wider">
                  {completedCount} / {tourStops.length}
                </span>
              </div>

              {isTourFullyFinished ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {t.allDone}
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                  {tourStops.length - completedCount} {t.leftCount}
                </span>
              )}
            </div>

            {/* List of Stops styled with Elegant Dark aesthetic */}
            <div className="overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3 flex-1 touch-pan-y">
              {tourStops.map((stop, index) => {
                const isSelected = selectedBarId === stop.bar.id;
                const isExpanded = expandedStopId === stop.id;
                const priceStr = '€'.repeat(stop.bar.priceLevel);
                const googleSingleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${stop.bar.name}, ${stop.bar.street}, Budapest`
                )}`;

                return (
                  <div
                    key={stop.id}
                    className={`bg-white/5 border border-white/5 p-3 sm:p-3.5 rounded-xl transition-all duration-150 ${
                      isSelected
                        ? 'border-[#FDD835]/50 bg-white/10 shadow-[0_0_15px_rgba(253,216,53,0.15)]'
                        : 'hover:bg-white/10'
                    } ${stop.completed ? 'opacity-70' : 'opacity-100'}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Stop Number Badge (Clickable for Check-in with 44px touch area) */}
                      <button
                        onClick={() => handleCheckIn(stop)}
                        className={`w-8 h-8 sm:w-6 sm:h-6 shrink-0 rounded-full flex items-center justify-center font-black text-xs transition-transform active:scale-90 cursor-pointer ${
                          stop.completed
                            ? 'bg-emerald-500 text-[#111111] shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : isSelected
                            ? 'bg-[#FDD835] text-[#111111] shadow-[0_0_10px_rgba(253,216,53,0.6)]'
                            : 'bg-[#FDD835]/60 hover:bg-[#FDD835] text-[#111111]'
                        }`}
                        title={stop.completed ? t.checkInDone : (lang === 'hu' ? 'Kattints a megérkezéshez' : 'Click to check in')}
                      >
                        {stop.completed ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                      </button>

                      {/* Bar Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectBar(stop.bar.id)}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`font-bold text-sm leading-snug truncate ${
                              stop.completed ? 'line-through text-white/50' : 'text-[#FDD835]'
                            }`}
                          >
                            {stop.bar.name}
                          </h4>
                          <span className="text-[10px] text-white/40 font-bold">{priceStr}</span>
                        </div>
                        <p className="text-[11px] text-white/50 mb-2">{stop.bar.street}</p>

                        {/* Challenge Callout Box */}
                        <div className="bg-black/40 border-l-2 border-[#FDD835] p-2 text-[11px] italic text-[#FDD835]/90 rounded-r-md">
                          <div className="flex items-center justify-between gap-1 mb-0.5 not-italic">
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#FDD835]/70">
                              🎯 {t.challengeTitle}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReRollChallenge(index);
                              }}
                              className="text-[9px] text-white/40 hover:text-[#FDD835] flex items-center gap-0.5 uppercase tracking-wider font-bold cursor-pointer py-1 px-1.5 bg-white/5 rounded"
                              title={t.reRollChallenge}
                            >
                              <Dices className="w-2.5 h-2.5" />
                              <span>{lang === 'hu' ? 'Új' : 'New'}</span>
                            </button>
                          </div>
                          "{lang === 'hu' ? stop.challengeHu : stop.challengeEn}"
                        </div>
                      </div>

                      {/* Controls (Move Up/Down, Swap Bar) */}
                      <div className="flex flex-col items-center gap-1 shrink-0 ml-1">
                        {index > 0 && (
                          <button
                            onClick={() => onMoveStop(index, index - 1)}
                            className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {index < tourStops.length - 1 && (
                          <button
                            onClick={() => onMoveStop(index, index + 1)}
                            className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onReRollBar(index)}
                          className="p-1.5 text-white/30 hover:text-[#FDD835] hover:bg-white/10 rounded transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                          title={t.reRollBar}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expand Details & Navigation Link */}
                    <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-white/5">
                      <button
                        onClick={() => setExpandedStopId(isExpanded ? null : stop.id)}
                        className="text-[11px] uppercase tracking-wider font-bold text-white/40 hover:text-white flex items-center gap-1 cursor-pointer py-1"
                      >
                        <span>{isExpanded ? t.less : t.details}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <a
                        href={googleSingleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] uppercase tracking-wider font-black text-[#FDD835] hover:opacity-80 flex items-center gap-1 py-1"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 bg-black/60 rounded-lg text-xs text-white/70 border border-white/5 animate-in fade-in duration-150">
                        <p className="mb-2 leading-relaxed text-[11px]">
                          {lang === 'hu' ? stop.bar.descriptionHu : stop.bar.descriptionEn}
                        </p>
                        {stop.bar.funFactHu && (
                          <div className="bg-[#FDD835]/10 p-2 rounded border border-[#FDD835]/20 text-[#FDD835] text-[10px] mb-2 font-medium">
                            <span className="font-bold">💡 {t.funFactTitle} </span>
                            {lang === 'hu' ? stop.bar.funFactHu : stop.bar.funFactEn}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {stop.bar.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-white/5 text-white/50 rounded font-bold"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3 sm:p-4 mt-auto border-t border-white/5 flex flex-col gap-2 flex-shrink-0 bg-[#0A0A0A]">
              {/* Primary Elegant Dark Copy Button */}
              <button
                onClick={handleCopy}
                className="w-full py-3 sm:py-3.5 border border-[#FDD835]/50 text-[#FDD835] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#FDD835] hover:text-[#111111] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer min-h-[44px]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNotification ? t.copied : t.shareBtn}</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={generateGoogleMapsRouteUrl(tourStops)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors text-center min-h-[42px]"
                >
                  <span>🗺️ Google Maps</span>
                </a>

                <button
                  onClick={handleWhatsAppShare}
                  className="py-2.5 px-3 bg-white/5 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px]"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
