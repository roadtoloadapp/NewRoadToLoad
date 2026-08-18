import React, { useState } from 'react';
import { X, PlusCircle, Save } from 'lucide-react';
import { Bar, PubCategory, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AddCustomBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBar: (bar: Bar) => void;
  lang: Language;
}

export const AddCustomBarModal: React.FC<AddCustomBarModalProps> = ({
  isOpen,
  onClose,
  onSaveBar,
  lang,
}) => {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('VII. kerület');
  const [category, setCategory] = useState<PubCategory>('ruin_bar');
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(1);
  const [description, setDescription] = useState('');
  const [funFact, setFunFact] = useState('');
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !street.trim()) return;

    const baseLat = 47.4980 + (Math.random() - 0.5) * 0.008;
    const baseLng = 19.0620 + (Math.random() - 0.5) * 0.008;

    const newBar: Bar = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      street: street.trim(),
      district,
      coords: [baseLat, baseLng],
      category,
      priceLevel,
      rating: 4.8,
      descriptionHu: description || 'Egy újabb rejtett budapesti kedvenc.',
      descriptionEn: description || 'A new secret spot in Budapest.',
      funFactHu: funFact || undefined,
      funFactEn: funFact || undefined,
      tags: [lang === 'hu' ? 'Saját hely' : 'Custom Spot', 'Budapest'],
      isCustom: true,
    };

    onSaveBar(newBar);
    onClose();
    setName('');
    setStreet('');
    setDescription('');
    setFunFact('');
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
              {t.addCustomSubtitle}
            </span>
            <h3 className="font-black text-lg text-[#FDD835] tracking-tight">{t.addCustomTitle}</h3>
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
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1">
              {t.inputBarName} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pl. Kis Pipa Bár"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1">
              {t.inputBarAddress} *
            </label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="pl. Akácfa utca 12."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1">
                {t.inputBarCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PubCategory)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#EEEEEE] focus:outline-none focus:border-[#FDD835]"
              >
                <option value="ruin_bar">{t.categoryRuin}</option>
                <option value="craft_beer">{t.categoryCraft}</option>
                <option value="underground">{t.categoryUnderground}</option>
                <option value="garden_patio">{t.categoryGarden}</option>
                <option value="cocktail_lounge">{t.categoryCocktail}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1">
                {t.priceSelectLabel}
              </label>
              <select
                value={priceLevel}
                onChange={(e) => setPriceLevel(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#EEEEEE] focus:outline-none focus:border-[#FDD835]"
              >
                <option value={1}>{t.budgetFriendly}</option>
                <option value={2}>{t.budgetModerate}</option>
                <option value={3}>{t.budgetPremium}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1">
              {t.inputBarDesc}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Miért különleges ez a hely? Hangulat, zene, italok..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FDD835]/20 active:scale-98 transition-all mt-1 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveBarBtn}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
