import React, { useState } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Dices, 
  Info, 
  Mail, 
  Compass, 
  Menu, 
  X, 
  PlusCircle,
  Globe
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  onQuickGenerate: () => void;
  onOpenPlanner: () => void;
  onOpenCatalog: () => void;
  onOpenRoulette: () => void;
  onOpenAddBar: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  tourStopsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onQuickGenerate,
  onOpenPlanner,
  onOpenCatalog,
  onOpenRoulette,
  onOpenAddBar,
  onOpenAbout,
  onOpenContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  return (
    <header className="h-16 bg-[#FDD835] text-[#111111] flex items-center justify-between px-3 sm:px-8 z-50 shrink-0 shadow-lg border-b border-[#111111]/10">
      {/* Brand Logo with Diamond RL Badge */}
      <div 
        onClick={onQuickGenerate}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        title="RoadToLoad"
      >
        <div className="w-8 h-8 bg-[#111111] rounded flex items-center justify-center rotate-45 shadow-md group-hover:scale-105 transition-transform">
          <div className="w-4 h-4 bg-[#FDD835] -rotate-45 font-black text-[9px] text-[#111111] text-center leading-4 select-none">
            RL
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-[#111111] font-black text-lg sm:text-xl tracking-tighter uppercase leading-tight">
            RoadToLoad
          </h1>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#111111]/70 hidden sm:block">
            Budapest Nightlife
          </span>
        </div>
      </div>

      {/* Main Navigation (Always visible on tablets & desktops, and quick-access on small screens) */}
      <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 text-[#111111] font-black text-xs sm:text-sm uppercase tracking-widest">
        {/* Rólunk / About */}
        <button
          type="button"
          onClick={() => {
            onOpenAbout();
            setMobileMenuOpen(false);
          }}
          className="hover:opacity-70 transition-opacity cursor-pointer py-1 px-1 font-black"
        >
          {t.navAbout}
        </button>

        {/* Kapcsolat / Contact */}
        <button
          type="button"
          onClick={() => {
            onOpenContact();
            setMobileMenuOpen(false);
          }}
          className="hover:opacity-70 transition-opacity cursor-pointer py-1 px-1 font-black"
        >
          {t.navContact}
        </button>

        {/* Extra features on md+ screens */}
        <button
          type="button"
          onClick={onOpenCatalog}
          className="hidden md:flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer py-1 px-1 font-black"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t.navCatalog}</span>
        </button>

        <button
          type="button"
          onClick={onOpenRoulette}
          className="hidden lg:flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer py-1 px-1 font-black"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>{t.navRoulette}</span>
        </button>

        <div className="h-4 w-[1px] bg-[#111111]/30 hidden sm:block" />

        {/* Language Switch Pill */}
        <div className="flex items-center bg-[#111111]/10 rounded-lg p-0.5 border border-[#111111]/15">
          <button
            type="button"
            onClick={() => onLanguageChange('hu')}
            className={`px-2 py-1 rounded text-xs font-black transition-all cursor-pointer ${
              lang === 'hu'
                ? 'bg-[#111111] text-[#FDD835] shadow-sm'
                : 'text-[#111111]/60 hover:text-[#111111]'
            }`}
            title="Magyar nyelv"
          >
            HU
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded text-xs font-black transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#111111] text-[#FDD835] shadow-sm'
                : 'text-[#111111]/60 hover:text-[#111111]'
            }`}
            title="English language"
          >
            EN
          </button>
        </div>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Custom Tour Planner Trigger */}
        <button
          type="button"
          onClick={onOpenPlanner}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#111111]/10 hover:bg-[#111111]/20 text-[#111111] border border-[#111111]/20 rounded-lg text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.btnCustomGen}</span>
        </button>

        {/* Primary Instant Generate Button */}
        <button
          type="button"
          onClick={() => {
            onQuickGenerate();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] hover:bg-[#222222] text-[#FDD835] font-black rounded-lg text-xs uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          title={t.btnGen}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FDD835]" />
          <span>{t.btnGen}</span>
        </button>

        {/* Mobile Extra Menu Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#111111] hover:bg-[#111111]/10 rounded-lg cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu for extra tools */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0F0F0F] text-[#EEEEEE] border-b border-[#FDD835]/30 px-5 py-5 flex flex-col gap-2.5 shadow-2xl z-[9998] animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Language Switcher Row */}
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 mb-1">
            <span className="text-xs font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-[#FDD835]" />
              <span>{lang === 'hu' ? 'Nyelv / Language' : 'Language / Nyelv'}</span>
            </span>
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => {
                  onLanguageChange('hu');
                }}
                className={`px-3 py-1 rounded text-xs font-black uppercase cursor-pointer ${
                  lang === 'hu' ? 'bg-[#FDD835] text-[#111111]' : 'text-white/50'
                }`}
              >
                HU
              </button>
              <button
                type="button"
                onClick={() => {
                  onLanguageChange('en');
                }}
                className={`px-3 py-1 rounded text-xs font-black uppercase cursor-pointer ${
                  lang === 'en' ? 'bg-[#FDD835] text-[#111111]' : 'text-white/50'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onQuickGenerate();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full p-3 bg-[#FDD835] text-[#111111] rounded-xl text-xs font-black uppercase tracking-wider text-left shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-[#111111]" />
            <span>{t.btnGen}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenPlanner();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-left border border-white/5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#FDD835]" />
            <span>{t.btnCustomGen}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenCatalog();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-left border border-white/5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#FDD835]" />
            <span>{t.navCatalog}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenRoulette();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-left border border-white/5 cursor-pointer"
          >
            <Dices className="w-4 h-4 text-[#FDD835]" />
            <span>{t.navRoulette}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAddBar();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-left border border-white/5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#FDD835]" />
            <span>{t.navAddBar}</span>
          </button>

          <div className="h-px bg-white/10 my-1" />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white border border-white/5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#FDD835]" />
              <span>{t.navAbout}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white border border-white/5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#FDD835]" />
              <span>{t.navContact}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
