import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  MapPin, 
  Check, 
  Compass,
  Star
} from 'lucide-react';
import { Bar, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PubCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBars: Bar[];
  tourBarIds: Set<string>;
  onAddBarToTour: (bar: Bar) => void;
  onSelectBarOnMap: (barId: string) => void;
  lang: Language;
}

export const PubCatalogModal: React.FC<PubCatalogModalProps> = ({
  isOpen,
  onClose,
  allBars,
  tourBarIds,
  onAddBarToTour,
  onSelectBarOnMap,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const filteredBars = allBars.filter((bar) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      bar.name.toLowerCase().includes(query) ||
      bar.street.toLowerCase().includes(query) ||
      bar.district.toLowerCase().includes(query) ||
      bar.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || bar.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
          <div>
            <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold block mb-0.5">
              {t.catalogSubtitle}
            </span>
            <h3 className="font-black text-lg text-[#FDD835] tracking-tight">{t.catalogTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-white/5 flex flex-col gap-2.5 bg-[#0A0A0A]/40">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835]"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 touch-pan-x no-scrollbar">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'ruin_bar', label: t.categoryRuin },
              { id: 'craft_beer', label: t.categoryCraft },
              { id: 'underground', label: t.categoryUnderground },
              { id: 'garden_patio', label: t.categoryGarden },
              { id: 'cocktail_lounge', label: t.categoryCocktail },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer min-h-[36px] flex items-center ${
                  selectedCategory === cat.id
                    ? 'bg-[#FDD835] text-[#111111]'
                    : 'bg-white/5 hover:bg-white/10 text-white/50 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pub Cards List */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3 flex-1 space-y-1">
          {filteredBars.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-xs font-medium">
              {t.noSearchResults}
            </div>
          ) : (
            filteredBars.map((bar) => {
              const isInTour = tourBarIds.has(bar.id);
              const priceStr = '€'.repeat(bar.priceLevel);

              return (
                <div
                  key={bar.id}
                  className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-sm text-[#FDD835]">{bar.name}</h4>
                      <span className="text-[10px] font-bold text-white/40">{priceStr}</span>
                      <span className="text-[9px] bg-[#FDD835]/15 text-[#FDD835] font-black px-1.5 py-0.5 rounded">
                        ★ {bar.rating}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/50 flex items-center gap-1 mb-1.5">
                      <MapPin className="w-3 h-3 text-white/40" />
                      <span>
                        {bar.street} ({bar.district})
                      </span>
                    </p>

                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-2 text-[11px]">
                      {lang === 'hu' ? bar.descriptionHu : bar.descriptionEn}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {bar.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded text-white/40 font-bold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                    <button
                      onClick={() => {
                        onAddBarToTour(bar);
                      }}
                      disabled={isInTour}
                      className={`flex-1 sm:flex-none py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        isInTour
                          ? 'bg-white/5 text-white/30 cursor-default border border-white/5'
                          : 'bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] shadow-md active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isInTour ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isInTour ? t.addedToTour : t.addToTour}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectBarOnMap(bar.id);
                        onClose();
                      }}
                      className="flex-1 sm:flex-none py-2 px-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center cursor-pointer"
                    >
                      {t.viewOnMap}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
