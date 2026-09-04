import React, { useState } from 'react';
import { 
  Route, 
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
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: (isOpen: boolean) => void;
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
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isMenuOpen = isMobileMenuOpen !== undefined ? isMobileMenuOpen : internalMenuOpen;

  const setMenuOpen = (open: boolean) => {
    setInternalMenuOpen(open);
    onToggleMobileMenu?.(open);
  };

  const t = TRANSLATIONS[lang];

  return (
    <header className="h-14 sm:h-16 bg-[#FDD835] text-[#111111] flex items-center justify-between px-2.5 sm:px-8 z-[600] shrink-0 shadow-md border-b border-[#111111]/10 relative">
      {/* Brand Logo with Distinct High-Contrast RL Badge */}
      <div 
        onClick={onQuickGenerate}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
        title="RoadToLoad - Budapest"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#111111] rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-[#111111]/20">
          <span className="font-black text-[11px] sm:text-xs text-[#FDD835] tracking-tighter leading-none">
            RL
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-[15px] sm:text-lg font-black tracking-tight leading-none text-[#111111]">
            <span>Road</span>
            <span className="text-[#111111]/60 px-0.5 font-bold text-xs sm:text-sm">To</span>
            <span>Load</span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#111111]/60 leading-none mt-0.5 hidden sm:block">
            Budapest Pub Crawl
          </span>
        </div>
      </div>

      {/* Main Navigation (Visible on tablets & desktops) */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[#111111] font-black text-xs sm:text-sm uppercase tracking-widest">
        {/* Rólunk / About */}
        <button
          type="button"
          onClick={() => {
            onOpenAbout();
            setMenuOpen(false);
          }}
          className="hover:opacity-70 transition-opacity cursor-pointer py-1 font-black"
        >
          {t.navAbout}
        </button>

        {/* Kapcsolat / Contact */}
        <button
          type="button"
          onClick={() => {
            onOpenContact();
            setMenuOpen(false);
          }}
          className="hover:opacity-70 transition-opacity cursor-pointer py-1 font-black"
        >
          {t.navContact}
        </button>

        {/* Extra features on md+ screens */}
        <button
          type="button"
          onClick={onOpenCatalog}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer py-1 font-black"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t.navCatalog}</span>
        </button>

        <button
          type="button"
          onClick={onOpenRoulette}
          className="hidden lg:flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer py-1 font-black"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>{t.navRoulette}</span>
        </button>
      </nav>

      {/* Action Area: High-Visibility Language Switcher & Quick Generate Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Dedicated High-Contrast Language Switcher */}
        <div 
          className="flex items-center bg-[#111111] p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-sm border border-[#111111]/30 shrink-0 select-none"
          role="group" 
          aria-label="Language selection"
        >
          <button
            type="button"
            onClick={() => onLanguageChange('hu')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-black tracking-wider transition-all cursor-pointer min-h-[26px] sm:min-h-[28px] min-w-[28px] sm:min-w-[32px] flex items-center justify-center ${
              lang === 'hu'
                ? 'bg-[#FDD835] text-[#111111] shadow-xs font-black'
                : 'text-white/80 hover:text-white font-bold'
            }`}
            title="Magyar nyelv"
            aria-pressed={lang === 'hu'}
          >
            HU
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-black tracking-wider transition-all cursor-pointer min-h-[26px] sm:min-h-[28px] min-w-[28px] sm:min-w-[32px] flex items-center justify-center ${
              lang === 'en'
                ? 'bg-[#FDD835] text-[#111111] shadow-xs font-black'
                : 'text-white/80 hover:text-white font-bold'
            }`}
            title="English language"
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
        </div>

        {/* Custom Tour Planner Trigger (Desktop) */}
        <button
          type="button"
          onClick={onOpenPlanner}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#111111]/10 hover:bg-[#111111]/20 text-[#111111] border border-[#111111]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[34px]"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.btnCustomGen}</span>
        </button>

        {/* Primary Instant Generate Button with Route (S-curve) Icon */}
        <button
          type="button"
          onClick={() => {
            onQuickGenerate();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#111111] hover:bg-[#222222] text-[#FDD835] font-black rounded-lg sm:rounded-xl text-xs uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer min-h-[30px] sm:min-h-[34px] whitespace-nowrap"
          title={t.btnGen}
        >
          <Route className="w-3.5 h-3.5 text-[#FDD835] stroke-[2.5]" />
          <span className="hidden sm:inline">{t.btnGen}</span>
          <span className="inline sm:hidden text-[11px] font-black">{lang === 'hu' ? 'Új túra' : 'New Tour'}</span>
        </button>

        {/* Mobile Extra Menu Hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="md:hidden p-1.5 text-[#111111] hover:bg-[#111111]/10 rounded-lg cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
          aria-label="Toggle Navigation"
        >
          {isMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
        </button>
      </div>

      {/* Mobile Drawer Menu with Backdrop Overlay */}
      {isMenuOpen && (
        <>
          {/* Dark backdrop overlay to close menu and dim background */}
          <div 
            className="md:hidden fixed inset-0 top-14 sm:top-16 bg-black/75 backdrop-blur-xs z-[999]"
            onClick={() => setMenuOpen(false)}
          />

          <div className="md:hidden absolute top-14 sm:top-16 left-0 w-full bg-[#0F0F0F] text-[#EEEEEE] border-b border-[#FDD835]/30 px-5 py-5 flex flex-col gap-2.5 shadow-2xl z-[1000] animate-in slide-in-from-top-2 duration-150">
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
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 bg-[#FDD835] text-[#111111] rounded-xl text-xs font-black uppercase tracking-wider text-left shadow-lg cursor-pointer"
            >
              <Route className="w-4 h-4 text-[#111111] stroke-[2.5]" />
              <span>{t.btnGen}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenPlanner();
                setMenuOpen(false);
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
                setMenuOpen(false);
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
                setMenuOpen(false);
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
                setMenuOpen(false);
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
                  setMenuOpen(false);
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
                  setMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white border border-white/5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#FDD835]" />
                <span>{t.navContact}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
