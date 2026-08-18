import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_BARS } from './data/bars';
import { Bar, TourStop, Language, TourGenerationOptions, SavedTourData } from './types';
import { TRANSLATIONS } from './data/translations';
import { generateTourRoute, getDistanceKm } from './utils/geo';
import { getRandomChallenge } from './data/challenges';

// Components
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { TourSheet } from './components/TourSheet';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { MobileActiveStopCard } from './components/MobileActiveStopCard';
import { TourGeneratorModal } from './components/TourGeneratorModal';
import { PubCatalogModal } from './components/PubCatalogModal';
import { RouletteModal } from './components/RouletteModal';
import { AddCustomBarModal } from './components/AddCustomBarModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';

const LOCAL_STORAGE_TOUR_KEY = 'roadToLoad_tour_v2';
const LOCAL_STORAGE_CUSTOM_BARS_KEY = 'roadToLoad_custom_bars_v2';
const LOCAL_STORAGE_LANG_KEY = 'roadToLoad_lang_v2';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    return (savedLang as Language) || 'hu';
  });

  const [mobileTab, setMobileTab] = useState<MobileTab>('map');

  const [allBars, setAllBars] = useState<Bar[]>(() => {
    const savedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_BARS_KEY);
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        const combined = [...INITIAL_BARS, ...(Array.isArray(parsed) ? parsed : [])];
        const seen = new Set<string>();
        return combined.filter((b) => {
          if (!b || !b.id || seen.has(b.id)) return false;
          seen.add(b.id);
          return true;
        });
      } catch {
        return INITIAL_BARS;
      }
    }
    return INITIAL_BARS;
  });

  const [tourStops, setTourStops] = useState<TourStop[]>(() => {
    const savedTour = localStorage.getItem(LOCAL_STORAGE_TOUR_KEY);
    if (savedTour) {
      try {
        const data: SavedTourData = JSON.parse(savedTour);
        // Valid if generated within last 18 hours
        if (Date.now() - data.timestamp < 18 * 60 * 60 * 1000 && data.stops?.length > 0) {
          return data.stops;
        }
      } catch {
        // Fallback
      }
    }
    return [];
  });

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);

  // Modal open states
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isAddBarOpen, setIsAddBarOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Save tour changes to localStorage
  const persistTour = useCallback((stops: TourStop[]) => {
    setTourStops(stops);
    localStorage.setItem(
      LOCAL_STORAGE_TOUR_KEY,
      JSON.stringify({ timestamp: Date.now(), stops })
    );
  }, []);

  // Save language changes
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, newLang);
  };

  // Quick Instant Tour Generation (3-5 bars with optimal route)
  const handleQuickGenerate = useCallback(() => {
    const r = Math.random();
    let count = 4;
    if (r < 0.35) count = 3;
    else if (r < 0.75) count = 4;
    else count = 5;

    const newTour = generateTourRoute(allBars, { stopCount: count }, lang);
    persistTour(newTour);
    setSelectedBarId(newTour[0]?.bar.id || null);
  }, [allBars, lang, persistTour]);

  // Initial load: if no tour, generate a default tour so map is full of life
  useEffect(() => {
    if (tourStops.length === 0) {
      handleQuickGenerate();
    }
  }, []);

  // Custom Tour Generator
  const handleCustomGenerate = (options: TourGenerationOptions) => {
    const newTour = generateTourRoute(allBars, options, lang);
    persistTour(newTour);
    setSelectedBarId(newTour[0]?.bar.id || null);
  };

  // Toggle stop complete check-in
  const handleToggleComplete = (stopId: string) => {
    const updated = tourStops.map((stop) => {
      if (stop.id === stopId) {
        return {
          ...stop,
          completed: !stop.completed,
          completedAt: !stop.completed ? Date.now() : undefined,
        };
      }
      return stop;
    });
    persistTour(updated);
  };

  // Re-roll single bar (swap stop with another unused pub)
  const handleReRollBar = (index: number) => {
    const currentTourBarIds = new Set(tourStops.map((s) => s.bar.id));
    const availableBars = allBars.filter((b) => !currentTourBarIds.has(b.id));

    if (availableBars.length === 0) return;

    // Pick closest available bar to the neighboring stop
    const referenceCoords =
      index > 0
        ? tourStops[index - 1].bar.coords
        : tourStops[index + 1]?.bar.coords || [47.498, 19.062];

    availableBars.sort(
      (a, b) =>
        getDistanceKm(referenceCoords, a.coords) -
        getDistanceKm(referenceCoords, b.coords)
    );

    // Pick from top 3 closest
    const pickIndex = Math.floor(Math.random() * Math.min(3, availableBars.length));
    const newBar = availableBars[pickIndex];
    const newChallenge = getRandomChallenge(lang);

    const updated = [...tourStops];
    updated[index] = {
      ...updated[index],
      bar: newBar,
      challengeHu: newChallenge.hu,
      challengeEn: newChallenge.en,
    };

    persistTour(updated);
    setSelectedBarId(newBar.id);
  };

  // Re-roll challenge for a stop
  const handleReRollChallenge = (index: number) => {
    const newChallenge = getRandomChallenge(lang);
    const updated = [...tourStops];
    updated[index] = {
      ...updated[index],
      challengeHu: newChallenge.hu,
      challengeEn: newChallenge.en,
    };
    persistTour(updated);
  };

  // Reorder stops
  const handleMoveStop = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tourStops.length) return;
    const updated = [...tourStops];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    persistTour(updated);
  };

  // Add individual bar from catalog or roulette to current tour
  const handleAddBarToTour = (bar: Bar) => {
    if (tourStops.some((s) => s.bar.id === bar.id)) return;
    const challenge = getRandomChallenge(lang);
    const newStop: TourStop = {
      id: `stop-${bar.id}-${Date.now()}`,
      bar,
      challengeHu: challenge.hu,
      challengeEn: challenge.en,
      completed: false,
    };
    const updated = [...tourStops, newStop];
    persistTour(updated);
    setSelectedBarId(bar.id);
  };

  // Save new custom bar
  const handleSaveCustomBar = (newBar: Bar) => {
    const updatedAllBars = [...allBars, newBar];
    setAllBars(updatedAllBars);

    // Save only custom ones to storage
    const customOnly = updatedAllBars.filter((b) => b.isCustom);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_BARS_KEY, JSON.stringify(customOnly));

    // Also auto-add to active tour
    handleAddBarToTour(newBar);
  };

  // Geolocation trigger
  const handleLocateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserCoords(coords);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to Budapest center
          setUserCoords([47.498, 19.062]);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const tourBarIds = new Set(tourStops.map((s) => s.bar.id));
  const t = TRANSLATIONS[lang];

  const completedStopsCount = tourStops.filter((s) => s.completed).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0A0A] text-[#EEEEEE] overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onQuickGenerate={handleQuickGenerate}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenRoulette={() => setIsRouletteOpen(true)}
        onOpenAddBar={() => setIsAddBarOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        tourStopsCount={tourStops.length}
      />

      {/* Main Map & Interactive UI Body */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Interactive Leaflet Map (Always rendered, background on mobile) */}
        <MapView
          allBars={allBars}
          tourStops={tourStops}
          userCoords={userCoords}
          selectedBarId={selectedBarId}
          lang={lang}
          onSelectBar={(id) => {
            setSelectedBarId(id);
            setMobileTab('map');
          }}
          onAddBarToTour={handleAddBarToTour}
          onLocateUser={handleLocateUser}
          onQuickGenerate={handleQuickGenerate}
        />

        {/* Mobile Active Stop Card (Shown at the bottom of the map above bottom bar on mobile) */}
        {mobileTab === 'map' && (
          <MobileActiveStopCard
            tourStops={tourStops}
            allBars={allBars}
            selectedBarId={selectedBarId}
            onSelectBar={(id) => setSelectedBarId(id)}
            onToggleComplete={handleToggleComplete}
            onReRollChallenge={handleReRollChallenge}
            onQuickGenerate={handleQuickGenerate}
            onOpenPlanner={() => setIsPlannerOpen(true)}
            onViewFullTour={() => setMobileTab('tour')}
            lang={lang}
          />
        )}

        {/* Desktop Tour Sheet (Floating) */}
        <div className="hidden sm:block">
          <TourSheet
            tourStops={tourStops}
            allBars={allBars}
            lang={lang}
            selectedBarId={selectedBarId}
            onSelectBar={(id) => setSelectedBarId(id)}
            onToggleComplete={handleToggleComplete}
            onReRollBar={handleReRollBar}
            onReRollChallenge={handleReRollChallenge}
            onMoveStop={handleMoveStop}
            onQuickGenerate={handleQuickGenerate}
            onOpenPlanner={() => setIsPlannerOpen(true)}
            isMobileView={false}
          />
        </div>

        {/* Mobile Full Tour View (When 'tour' tab is active on mobile) */}
        {mobileTab === 'tour' && (
          <div className="sm:hidden">
            <TourSheet
              tourStops={tourStops}
              allBars={allBars}
              lang={lang}
              selectedBarId={selectedBarId}
              onSelectBar={(id) => {
                setSelectedBarId(id);
                setMobileTab('map');
              }}
              onToggleComplete={handleToggleComplete}
              onReRollBar={handleReRollBar}
              onReRollChallenge={handleReRollChallenge}
              onMoveStop={handleMoveStop}
              onQuickGenerate={handleQuickGenerate}
              onOpenPlanner={() => setIsPlannerOpen(true)}
              isMobileView={true}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onTabChange={(tab) => setMobileTab(tab)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenRoulette={() => setIsRouletteOpen(true)}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        tourStopsCount={tourStops.length}
        completedStopsCount={completedStopsCount}
        lang={lang}
      />

      {/* Modals */}
      <TourGeneratorModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        onGenerate={handleCustomGenerate}
        lang={lang}
        userCoords={userCoords}
        onRequestUserLocation={handleLocateUser}
      />

      <PubCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        allBars={allBars}
        tourBarIds={tourBarIds}
        onAddBarToTour={handleAddBarToTour}
        onSelectBarOnMap={(id) => {
          setSelectedBarId(id);
          setMobileTab('map');
        }}
        lang={lang}
      />

      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        allBars={allBars}
        onAddWinnerToTour={handleAddBarToTour}
        onSelectOnMap={(id) => {
          setSelectedBarId(id);
          setMobileTab('map');
        }}
        lang={lang}
      />

      <AddCustomBarModal
        isOpen={isAddBarOpen}
        onClose={() => setIsAddBarOpen(false)}
        onSaveBar={handleSaveCustomBar}
        lang={lang}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        lang={lang}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        lang={lang}
      />
    </div>
  );
}
