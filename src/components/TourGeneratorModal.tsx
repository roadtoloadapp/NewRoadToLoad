import React, { useState } from 'react';
import { X, Sparkles, Sliders, MapPin } from 'lucide-react';
import { PubCategory, TourGenerationOptions, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CITY_HUBS } from '../data/bars';

interface TourGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: TourGenerationOptions) => void;
  lang: Language;
  userCoords: [number, number] | null;
  onRequestUserLocation: () => void;
}

export const TourGeneratorModal: React.FC<TourGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  lang,
  userCoords,
  onRequestUserLocation,
}) => {
  const t = TRANSLATIONS[lang];
  const [stopCount, setStopCount] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState<PubCategory | 'all'>('all');
  const [selectedPrice, setSelectedPrice] = useState<number | 'all'>('all');
  const [startType, setStartType] = useState<'random' | 'gps' | 'hub'>('random');
  const [selectedHub, setSelectedHub] = useState<string>('deak');

  if (!isOpen) return null;

  const categories: { id: PubCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'ruin_bar', label: t.categoryRuin },
    { id: 'craft_beer', label: t.categoryCraft },
    { id: 'underground', label: t.categoryUnderground },
    { id: 'garden_patio', label: t.categoryGarden },
    { id: 'cocktail_lounge', label: t.categoryCocktail },
    { id: 'party_complex', label: t.categoryParty },
  ];

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let coordsToUse: [number, number] | null = null;
    let startFromLoc = false;

    if (startType === 'gps') {
      startFromLoc = true;
      coordsToUse = userCoords;
    } else if (startType === 'hub') {
      const hub = CITY_HUBS.find((h) => h.id === selectedHub);
      if (hub) {
        startFromLoc = true;
        coordsToUse = hub.coords;
      }
    }

    onGenerate({
      stopCount,
      category: selectedCategory,
      priceLevel: selectedPrice,
      startFromLocation: startFromLoc,
      userCoords: coordsToUse,
    });
    onClose();
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
              {t.settingsSubtitle}
            </span>
            <h3 className="font-black text-lg text-[#FDD835] tracking-tight">{t.generatorTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleStartSubmit} className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Stop Count Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-2">
              {t.howManyStops}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setStopCount(num)}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    stopCount === num
                      ? 'bg-[#FDD835] text-[#111111] shadow-[0_0_12px_rgba(253,216,53,0.4)] scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'
                  }`}
                >
                  {num} {t.barsCountUnit}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Point Preference */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-2">
              {t.startingPoint}
            </label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStartType('random')}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  startType === 'random'
                    ? 'bg-[#FDD835]/15 border-[#FDD835]/60 text-[#FDD835]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span>{t.startRandom}</span>
                <span>🎲</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStartType('gps');
                  onRequestUserLocation();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  startType === 'gps'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>{t.startFromGps}</span>
                </div>
                {userCoords ? (
                  <span className="text-[9px] bg-sky-400/20 text-sky-300 px-1.5 py-0.5 rounded font-black">GPS OK</span>
                ) : (
                  <span className="text-[10px] text-white/40 font-normal normal-case">
                    {t.clickToEnableGps}
                  </span>
                )}
              </button>

              <div
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  startType === 'hub'
                    ? 'bg-black/60 border-[#FDD835]/40 text-[#EEEEEE]'
                    : 'bg-white/5 border-white/5 text-white/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span onClick={() => setStartType('hub')} className="cursor-pointer text-[10px] uppercase tracking-widest font-black text-white/60">
                    🚇 {t.subwayHub}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CITY_HUBS.map((hub) => (
                    <button
                      type="button"
                      key={hub.id}
                      onClick={() => {
                        setStartType('hub');
                        setSelectedHub(hub.id);
                      }}
                      className={`p-2 text-xs rounded-lg border font-bold uppercase tracking-wider cursor-pointer ${
                        startType === 'hub' && selectedHub === hub.id
                          ? 'bg-[#FDD835] text-[#111111] border-[#FDD835]'
                          : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {hub.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vibe / Category Filter */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-2">
              {t.atmosphere}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#FDD835] text-[#111111] shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-white/50 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-2">
              {t.priceLevelLabel}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'all', label: t.priceAll },
                { id: 1, label: t.priceBudget },
                { id: 2, label: t.priceMid },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPrice(p.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center border transition-all cursor-pointer ${
                    selectedPrice === p.id
                      ? 'bg-[#FDD835]/15 border-[#FDD835] text-[#FDD835]'
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FDD835]/20 active:scale-98 transition-all mt-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-[#111111]" />
            <span>{t.btnGenerateTourNow}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
