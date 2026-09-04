import React, { useState, useRef } from 'react';
import { 
  Map, 
  ListOrdered, 
  Compass, 
  Dices, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

export type MobileTab = 'map' | 'tour';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onOpenCatalog: () => void;
  onOpenRoulette: () => void;
  onOpenPlanner: () => void;
  tourStopsCount: number;
  completedStopsCount: number;
  lang: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCatalog,
  onOpenRoulette,
  onOpenPlanner,
  tourStopsCount,
  completedStopsCount,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      setDragY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setDragY(Math.min(deltaY * 0.4, 40));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (deltaY > 30) {
        setIsCollapsed(true);
      }
    }
    touchStartY.current = null;
    setDragY(0);
  };

  // If collapsed: Show a compact, unobtrusive floating pill button to restore the bottom navigation
  if (isCollapsed) {
    return (
      <div className="md:hidden fixed bottom-2.5 left-1/2 -translate-x-1/2 z-[550] select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="bg-[#0A0A0A]/95 hover:bg-[#161616] text-[#FDD835] border border-[#FDD835]/40 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-1.5 text-xs font-black uppercase tracking-wider active:scale-95 cursor-pointer min-h-[36px]"
          title={lang === 'hu' ? 'Alsó menüsáv megnyitása' : 'Open bottom navigation'}
        >
          <ChevronUp className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
          <span>{lang === 'hu' ? 'Menü' : 'Menu'}</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: dragY !== 0 ? `translateY(${dragY}px)` : undefined,
        transition: dragY === 0 ? 'transform 0.18s ease-out' : 'none',
      }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-[550] bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-1 pb-1.5 select-none shadow-[0_-10px_25px_rgba(0,0,0,0.8)] pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* Top Drag Handle to quickly collapse bottom bar */}
      <div 
        onClick={() => setIsCollapsed(true)}
        className="w-full flex items-center justify-center py-0.5 cursor-pointer group"
        title={lang === 'hu' ? 'Húzd le az elrejtéshez vagy koppints ide' : 'Swipe down or tap to hide navigation'}
      >
        <div className="w-8 h-1 bg-white/20 group-hover:bg-[#FDD835] rounded-full transition-colors" />
      </div>

      <div className="flex items-center justify-around">
        {/* 1. Térkép / Map Tab */}
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[44px] ${
            activeTab === 'map'
              ? 'text-[#FDD835] font-black'
              : 'text-white/50 hover:text-white/80 font-bold'
          }`}
        >
          <div className="relative">
            <Map className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'map' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeTab === 'map' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FDD835] rounded-full shadow-[0_0_6px_#FDD835]" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
            {t.tabMap}
          </span>
        </button>

        {/* 2. Útiterv / Itinerary Tab */}
        <button
          type="button"
          onClick={() => onTabChange('tour')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[44px] relative ${
            activeTab === 'tour'
              ? 'text-[#FDD835] font-black'
              : 'text-white/50 hover:text-white/80 font-bold'
          }`}
        >
          <div className="relative">
            <ListOrdered className={`w-4.5 h-4.5 mb-0.5 ${activeTab === 'tour' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {tourStopsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-[#FDD835] text-[#111111] font-black text-[9px] rounded-full shadow-md min-w-[16px] text-center">
                {completedStopsCount > 0 ? `${completedStopsCount}/${tourStopsCount}` : tourStopsCount}
              </span>
            )}
            {activeTab === 'tour' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FDD835] rounded-full shadow-[0_0_6px_#FDD835]" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
            {t.tabTour}
          </span>
        </button>

        {/* 3. Helyek / Catalog Modal Trigger */}
        <button
          type="button"
          onClick={onOpenCatalog}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-white/50 hover:text-white/80 font-bold transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <Compass className="w-4.5 h-4.5 mb-0.5 stroke-2" />
          <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
            {t.tabCatalog}
          </span>
        </button>

        {/* 4. Rulett / Roulette Trigger */}
        <button
          type="button"
          onClick={onOpenRoulette}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-white/50 hover:text-white/80 font-bold transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <Dices className="w-4.5 h-4.5 mb-0.5 stroke-2" />
          <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
            {t.tabRoulette}
          </span>
        </button>

        {/* 5. Tervező / Custom Planner Trigger */}
        <button
          type="button"
          onClick={onOpenPlanner}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-white/50 hover:text-white/80 font-bold transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <SlidersHorizontal className="w-4.5 h-4.5 mb-0.5 stroke-2" />
          <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
            {t.tabPlanner}
          </span>
        </button>
      </div>
    </div>
  );
};
