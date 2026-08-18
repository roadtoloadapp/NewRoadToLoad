import React from 'react';
import { X, Beer, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0F0F0F] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#111111] rounded flex items-center justify-center rotate-45 border border-[#FDD835]/40 shadow-md">
              <div className="w-4 h-4 bg-[#FDD835] -rotate-45 font-black text-[9px] text-[#111111] text-center leading-4">
                RL
              </div>
            </div>
            <div>
              <h3 className="font-black text-lg text-[#FDD835] tracking-tight uppercase">
                RoadToLoad
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                {lang === 'hu' ? 'Budapest Kocsmatúra • Éjszakai Útvonalak' : 'Budapest Pub Crawl • Nightlife Engine'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Body */}
        <div className="p-6 flex flex-col gap-4 text-xs text-white/80 leading-relaxed max-h-[75vh] overflow-y-auto">
          <div
            className="text-xs text-white/75 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t.aboutBody }}
          />

          <div className="h-px bg-white/10 my-1" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 font-black text-[#FDD835] mb-1 uppercase tracking-wider text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{lang === 'hu' ? 'Romkocsma kultúra' : 'Ruin Bar Heritage'}</span>
              </div>
              <p className="text-white/50 text-[11px]">
                {lang === 'hu'
                  ? 'A 2000-es évek elején született pesti romkocsmák elhagyatott bérházak udvaraiból lettek a világ leghangulatosabb közösségi terei.'
                  : 'Born in the early 2000s in abandoned courtyards, Budapest ruin bars became world-renowned artistic cultural hubs.'}
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 font-black text-emerald-400 mb-1 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'hu' ? 'Felelős bulizás' : 'Safe Nightlife'}</span>
              </div>
              <p className="text-white/50 text-[11px]">
                {lang === 'hu'
                  ? 'Igyatok bőségesen vizet a körök között, vigyázzatok a csapatotokra, és tiszteljétek a lakók nyugalmát.'
                  : 'Alternate your rounds with water, look after your friends, and respect neighborhood quiet hours.'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#111111] border border-white/10 rounded-xl flex items-center justify-between mt-2">
            <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">
              © {new Date().getFullYear()} RoadToLoad • hello@roadtoload.hu
            </span>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
