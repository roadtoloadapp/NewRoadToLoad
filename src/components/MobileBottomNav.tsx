import React from 'react';
import { 
  Map, 
  ListOrdered, 
  Compass, 
  Dices, 
  SlidersHorizontal 
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around select-none shadow-[0_-10px_25px_rgba(0,0,0,0.8)] pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
      {/* 1. Térkép / Map Tab */}
      <button
        type="button"
        onClick={() => onTabChange('map')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[46px] ${
          activeTab === 'map'
            ? 'text-[#FDD835] font-black'
            : 'text-white/50 hover:text-white/80 font-bold'
        }`}
      >
        <div className="relative">
          <Map className={`w-5 h-5 mb-0.5 ${activeTab === 'map' ? 'stroke-[2.5]' : 'stroke-2'}`} />
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
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[46px] relative ${
          activeTab === 'tour'
            ? 'text-[#FDD835] font-black'
            : 'text-white/50 hover:text-white/80 font-bold'
        }`}
      >
        <div className="relative">
          <ListOrdered className={`w-5 h-5 mb-0.5 ${activeTab === 'tour' ? 'stroke-[2.5]' : 'stroke-2'}`} />
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
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/50 hover:text-white/80 font-bold transition-all active:scale-95 cursor-pointer min-h-[46px]"
      >
        <Compass className="w-5 h-5 mb-0.5 stroke-2" />
        <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
          {t.tabCatalog}
        </span>
      </button>

      {/* 4. Rulett / Roulette Trigger */}
      <button
        type="button"
        onClick={onOpenRoulette}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/50 hover:text-white/80 font-bold transition-all active:scale-95 cursor-pointer min-h-[46px]"
      >
        <Dices className="w-5 h-5 mb-0.5 stroke-2" />
        <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
          {t.tabRoulette}
        </span>
      </button>

      {/* 5. Tervező / Custom Planner Trigger */}
      <button
        type="button"
        onClick={onOpenPlanner}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/50 hover:text-white/80 font-bold transition-all active:scale-95 cursor-pointer min-h-[46px]"
      >
        <SlidersHorizontal className="w-5 h-5 mb-0.5 stroke-2" />
        <span className="text-[10px] uppercase tracking-wider leading-none mt-1">
          {t.tabPlanner}
        </span>
      </button>
    </div>
  );
};
