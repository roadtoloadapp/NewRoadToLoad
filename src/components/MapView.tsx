import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bar, TourStop, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  Crosshair, 
  Maximize2, 
  Navigation, 
  ExternalLink,
  Sparkles,
  Footprints,
  Route
} from 'lucide-react';
import { calculateTourStats } from '../utils/geo';
import { fetchStreetWalkingRoute } from '../utils/navigationRoute';
import { getGoogleMapsWalkingUrl, getAppleMapsWalkingUrl } from '../utils/mapLinks';

interface MapViewProps {
  allBars: Bar[];
  tourStops: TourStop[];
  userCoords: [number, number] | null;
  selectedBarId: string | null;
  lang: Language;
  onSelectBar: (barId: string) => void;
  onAddBarToTour?: (bar: Bar) => void;
  onLocateUser: () => void;
  onQuickGenerate?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  allBars,
  tourStops,
  userCoords,
  selectedBarId,
  lang,
  onSelectBar,
  onAddBarToTour,
  onLocateUser,
  onQuickGenerate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [streetRouteCoords, setStreetRouteCoords] = useState<[number, number][]>([]);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  const t = TRANSLATIONS[lang];
  const { totalDistanceMeters, totalWalkMinutes } = calculateTourStats(tourStops);

  // Fetch real street walking navigation path whenever tour stops change
  useEffect(() => {
    let isCancelled = false;

    if (tourStops.length > 1) {
      const directPoints = tourStops.map((s) => s.bar.coords);
      // Instant fallback so lines appear immediately
      setStreetRouteCoords(directPoints);
      setIsRoutingLoading(true);

      fetchStreetWalkingRoute(directPoints)
        .then((navCoords) => {
          if (!isCancelled) {
            setStreetRouteCoords(navCoords);
            setIsRoutingLoading(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setIsRoutingLoading(false);
          }
        });
    } else {
      setStreetRouteCoords([]);
      setIsRoutingLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [tourStops]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Budapest Ruin Bar district / Erzsébetváros
    const map = L.map(mapContainerRef.current, {
      center: [47.4980, 19.0620],
      zoom: 15,
      zoomControl: false,
    });

    // CartoDB Dark Matter tiles (pure dark aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user location pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="user-location-pulse" title="${lang === 'hu' ? 'Te itt vagy' : 'You are here'}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userCoords);
      } else {
        userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(map);
        userMarkerRef.current.bindPopup(
          `<div class="text-xs font-black uppercase tracking-wider text-sky-400">📍 ${lang === 'hu' ? 'Jelenlegi pozíciód' : 'Your Location'}</div>`
        );
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords, lang]);

  // Render Tour and all bars on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const tourBarIds = new Set(tourStops.map((s) => s.bar.id));
    const activeCoords: [number, number][] = [];

    // 1. Draw real street walking navigation polyline for tour stops
    if (tourStops.length > 1) {
      const polylinePoints = streetRouteCoords.length > 0 
        ? streetRouteCoords 
        : tourStops.map((s) => s.bar.coords);
      
      // Layer 1: Dark casing border for clean contrast on dark maps
      L.polyline(polylinePoints, {
        color: '#050505',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      // Layer 2: Clean solid gold navigation line (Google Maps / Apple Maps walking navigation style)
      L.polyline(polylinePoints, {
        color: '#FDD835',
        weight: 4.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'navigation-walking-path',
      }).addTo(layerGroup);
    }

    // 2. Add Tour Stop Markers
    tourStops.forEach((stop, index) => {
      const bar = stop.bar;
      activeCoords.push(bar.coords);

      const isDone = stop.completed;
      const markerHtml = `
        <div class="marker-pin ${isDone ? 'completed' : ''}" style="${selectedBarId === bar.id ? 'transform: rotate(-45deg) scale(1.25); z-index: 100;' : ''}">
          <div class="marker-content">${isDone ? '✓' : index + 1}</div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
      });

      const priceStr = '€'.repeat(bar.priceLevel);
      const googleMapsUrl = getGoogleMapsWalkingUrl(bar.name, bar.street, bar.coords);
      const appleMapsUrl = getAppleMapsWalkingUrl(bar.name, bar.street, bar.coords);

      const popupContent = `
        <div class="p-1 max-w-[250px]">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-[#FDD835] text-[#111111]">
              #${index + 1} • ${t.stopLabel}
            </span>
            <span class="text-xs font-bold text-white/50">${priceStr}</span>
          </div>
          <h4 class="font-black text-sm text-[#FDD835] tracking-tight mb-0.5">${bar.name}</h4>
          <p class="text-[11px] text-white/50 mb-2">${bar.street}</p>
          <div class="bg-black/60 p-2 rounded border-l-2 border-[#FDD835] mb-2.5 text-xs">
            <div class="text-[9px] font-black uppercase tracking-wider text-[#FDD835] mb-0.5">🎯 ${t.challengeTitle}</div>
            <div class="text-[#EEEEEE] italic text-[11px]">"${lang === 'hu' ? stop.challengeHu : stop.challengeEn}"</div>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
               class="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] text-[11px] font-black uppercase tracking-wider rounded transition-transform active:scale-95 text-center shadow-sm">
              <span>Google</span> ↗
            </a>
            <a href="${appleMapsUrl}" target="_blank" rel="noopener noreferrer" 
               class="flex items-center justify-center gap-1 py-1.5 px-2 bg-white/15 hover:bg-white/25 text-white text-[11px] font-black uppercase tracking-wider rounded transition-transform active:scale-95 text-center border border-white/15">
              <span>Apple (iOS)</span> ↗
            </a>
          </div>
        </div>
      `;

      const marker = L.marker(bar.coords, { icon })
        .addTo(layerGroup)
        .bindPopup(popupContent);

      marker.on('click', () => {
        onSelectBar(bar.id);
      });

      if (selectedBarId === bar.id) {
        marker.openPopup();
      }
    });

    // 3. Add other Budapest bars in catalog as subtle discovery pins
    allBars
      .filter((b) => !tourBarIds.has(b.id))
      .forEach((bar) => {
        const icon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="marker-pin inactive" style="width: 22px; height: 22px; margin: -11px 0 0 -11px; ${selectedBarId === bar.id ? 'transform: rotate(-45deg) scale(1.3); background: #FDD835;' : ''}">
              <div class="marker-content" style="font-size: 9px;">🍺</div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 22],
          popupAnchor: [0, -20],
        });

        const priceStr = '€'.repeat(bar.priceLevel);
        const googleMapsUrl = getGoogleMapsWalkingUrl(bar.name, bar.street, bar.coords);
        const appleMapsUrl = getAppleMapsWalkingUrl(bar.name, bar.street, bar.coords);

        const popupContent = `
          <div class="p-1 max-w-[230px]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/70">
                ${bar.district}
              </span>
              <span class="text-xs font-bold text-white/50">${priceStr}</span>
            </div>
            <h4 class="font-black text-sm text-[#FDD835] tracking-tight mb-0.5">${bar.name}</h4>
            <p class="text-[11px] text-white/50 mb-2">${bar.street}</p>
            <p class="text-xs text-white/70 line-clamp-2 mb-2.5 leading-relaxed text-[11px]">
              ${lang === 'hu' ? bar.descriptionHu : bar.descriptionEn}
            </p>
            <div class="grid grid-cols-2 gap-1.5">
              <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
                 class="block text-center py-1.5 px-2 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] text-[10px] font-black uppercase tracking-wider rounded transition-transform active:scale-95">
                Google ↗
              </a>
              <a href="${appleMapsUrl}" target="_blank" rel="noopener noreferrer" 
                 class="block text-center py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors border border-white/10">
                Apple ↗
              </a>
            </div>
          </div>
        `;

        const marker = L.marker(bar.coords, { icon })
          .addTo(layerGroup)
          .bindPopup(popupContent);

        marker.on('click', () => {
          onSelectBar(bar.id);
        });

        if (selectedBarId === bar.id) {
          marker.openPopup();
        }
      });

    // Auto-fit tour bounds if active tour exists
    if (activeCoords.length > 0) {
      const bounds = L.latLngBounds(activeCoords);
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 16,
      });
    }
  }, [allBars, tourStops, selectedBarId, lang, onSelectBar, t, streetRouteCoords]);

  // Center Budapest function
  const handleCenterBudapest = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([47.4980, 19.0620], 15, { duration: 0.8 });
    }
  };

  // Fit active tour bounds
  const handleFitTour = () => {
    if (mapInstanceRef.current && tourStops.length > 0) {
      const coords = tourStops.map((s) => s.bar.coords);
      mapInstanceRef.current.fitBounds(L.latLngBounds(coords), {
        padding: [80, 80],
        maxZoom: 16,
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#121212] overflow-hidden">
      {/* Subtle Dot Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 dot-grid-pattern z-0" />

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-10" id="map" />

      {/* Walking GPS Navigation Status Tag */}
      {tourStops.length > 1 && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[400] bg-[#1A1A1A]/90 backdrop-blur-md border border-[#FDD835]/30 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FDD835] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FDD835]"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FDD835] flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-[#FDD835]" />
            {lang === 'hu' ? 'Gyalogos Utcanavigáció' : 'Street Walking Navigation'}
          </span>
        </div>
      )}

      {/* Floating Map Action Controls */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[400] flex flex-col gap-1.5 sm:gap-2">
        {onQuickGenerate && (
          <button
            onClick={onQuickGenerate}
            className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black border border-[#FDD835] rounded-xl shadow-2xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[42px] min-w-[42px]"
            title={tourStops.length > 0 ? (lang === 'hu' ? 'Új túra generálása' : 'Generate new tour') : (lang === 'hu' ? 'Túra generálás' : 'Generate tour')}
            aria-label="Generate new tour"
          >
            <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#111111] fill-[#111111]" />
            <span className="hidden sm:inline">{tourStops.length > 0 ? (lang === 'hu' ? 'Új túra' : 'New Tour') : (lang === 'hu' ? 'Túra generálás' : 'Generate')}</span>
          </button>
        )}

        <button
          onClick={onLocateUser}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2 bg-[#1A1A1A]/90 hover:bg-[#222222] text-[#EEEEEE] hover:text-[#FDD835] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[42px] min-w-[42px]"
          title={t.locateMe}
          aria-label={t.locateMe}
        >
          <Crosshair className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#FDD835]" />
          <span className="hidden sm:inline">{t.locateMe}</span>
        </button>

        {tourStops.length > 0 && (
          <button
            onClick={handleFitTour}
            className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2 bg-[#1A1A1A]/90 hover:bg-[#222222] text-[#EEEEEE] hover:text-[#FDD835] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[42px] min-w-[42px]"
            title={t.fitTour}
            aria-label={t.fitTour}
          >
            <Maximize2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#FDD835]" />
            <span className="hidden sm:inline">{t.fitTour}</span>
          </button>
        )}

        <button
          onClick={handleCenterBudapest}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2 bg-[#1A1A1A]/90 hover:bg-[#222222] text-[#EEEEEE] hover:text-[#FDD835] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[42px] min-w-[42px]"
          title={t.centerBudapest}
          aria-label={t.centerBudapest}
        >
          <Navigation className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#FDD835]" />
          <span className="hidden sm:inline">{t.centerBudapest}</span>
        </button>
      </div>

      {/* Floating HUD Tour Summary Badge (from Elegant Dark design) */}
      {tourStops.length > 0 && (
        <div className="hidden md:flex absolute bottom-8 left-8 z-[400] bg-[#1A1A1A]/90 backdrop-blur-md border border-[#FDD835]/30 p-4 rounded-xl items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#FDD835] font-bold">
              {t.hudTourTitle}
            </span>
            <span className="text-base font-black text-white tracking-tight">
              {t.hudTourSubtitle}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
              {t.hudStops}
            </span>
            <span className="text-base font-bold text-white">
              {tourStops.length} {t.hudBars}
            </span>
          </div>

          {onQuickGenerate && (
            <>
              <div className="h-8 w-[1px] bg-white/10" />
              <button
                onClick={onQuickGenerate}
                className="bg-[#FDD835] text-[#111111] px-5 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                {t.hudReGenerate}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
