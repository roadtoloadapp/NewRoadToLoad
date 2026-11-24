import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { Bar, TourStop, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Crosshair,
  Maximize2,
  Navigation,
  Route,
  Plus,
  Minus,
  Layers,
  Loader2,
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
  isObscured?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Crisp geometric vector pin for active tour stops
function getTourStopMarkerSvg(
  num: number,
  isDone: boolean,
  isSelected: boolean
): string {
  const width = isSelected ? 42 : 36;
  const height = isSelected ? 52 : 44;
  const fill = isDone ? '#10B981' : '#FDD835';
  const stroke = isSelected ? '#FFFFFF' : '#0A0A0A';
  const strokeWidth = isSelected ? 2.5 : 1.75;
  const textFill = isDone ? '#10B981' : '#FDD835';
  const fontSize = num >= 10 ? 11.5 : 13.5;

  const innerContent = isDone
    ? `<path d="M13.5 17.5 L16.5 20.5 L22.8 14.2" stroke="#10B981" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />`
    : `<text
        x="18"
        y="18"
        text-anchor="middle"
        dominant-baseline="central"
        fill="${textFill}"
        font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        font-weight="800"
        font-size="${fontSize}"
        style="font-variant-numeric: tabular-nums; pointer-events: none; user-select: none;"
      >${num}</text>`;

  return `
    <div class="pro-marker-root ${isSelected ? 'marker-selected-pulse' : ''}" style="width: ${width}px; height: ${height}px;">
      <svg width="${width}" height="${height}" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.75));">
        <path
          d="M18 45 C18 45 3.5 28.5 3.5 17.5 C3.5 9.49 9.99 3 18 3 C26.01 3 32.5 9.49 32.5 17.5 C32.5 28.5 18 45 18 45 Z"
          fill="${fill}"
          stroke="${stroke}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
        />
        <circle
          cx="18"
          cy="17.5"
          r="10.5"
          fill="#0F0F0F"
        />
        ${innerContent}
      </svg>
    </div>
  `;
}

// Clean architectural discovery dot for catalog bars (no emoji clutter)
function getCatalogMarkerSvg(isSelected: boolean): string {
  const hitbox = 28;
  const dotSize = isSelected ? 16 : 11;
  const ringStyle = isSelected
    ? 'background: #FDD835; border: 2.5px solid #FFFFFF; box-shadow: 0 0 0 5px rgba(253, 216, 53, 0.28), 0 4px 12px rgba(0,0,0,0.85);'
    : 'background: #18181B; border: 2px solid rgba(253, 216, 53, 0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.8);';

  return `
    <div class="pro-catalog-marker ${isSelected ? 'selected' : ''}" style="width: ${hitbox}px; height: ${hitbox}px;">
      <div style="width: ${dotSize}px; height: ${dotSize}px; border-radius: 9999px; ${ringStyle} display: flex; align-items: center; justify-content: center; transition: all 0.18s ease;">
        ${!isSelected ? '<span style="width: 4px; height: 4px; border-radius: 9999px; background: #FDD835;"></span>' : ''}
      </div>
    </div>
  `;
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
  isObscured = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const lastTourSigRef = useRef<string>('');

  const [streetRouteCoords, setStreetRouteCoords] = useState<[number, number][]>([]);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [showAllBars, setShowAllBars] = useState(true);

  const t = TRANSLATIONS[lang];
  const { totalDistanceMeters, totalWalkMinutes } = calculateTourStats(tourStops);
  const formattedDistance =
    totalDistanceMeters >= 1000
      ? `${(totalDistanceMeters / 1000).toFixed(1)} ${t.km}`
      : `${totalDistanceMeters} ${t.meters}`;

  // Fetch real street walking navigation path whenever tour stops change
  useEffect(() => {
    let isCancelled = false;

    if (tourStops.length > 1) {
      const directPoints = tourStops.map((s) => s.bar.coords);
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

  // Initialize Map (OpenFreeMap Dark Vector + OSM France Raster Fallback)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [47.4980, 19.0620],
      zoom: 15,
      zoomControl: false,
    });

    let usingFallback = false;
    const addFallbackRasterLayer = () => {
      if (usingFallback) return;
      usingFallback = true;
      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abc',
        maxZoom: 20,
        className: 'osm-dark-tiles',
      }).addTo(map);
    };

    const isWebGLAvailable = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl2') || canvas.getContext('webgl'))
        );
      } catch {
        return false;
      }
    };

    if (isWebGLAvailable()) {
      try {
        const glLayer = maplibreGL({
          style: 'https://tiles.openfreemap.org/styles/dark',
        }).addTo(map);

        const glMap = glLayer.getMaplibreMap();
        glMap?.on('error', () => {
          if (!glMap.isStyleLoaded()) {
            map.removeLayer(glLayer);
            addFallbackRasterLayer();
          }
        });
      } catch {
        addFallbackRasterLayer();
      }
    } else {
      addFallbackRasterLayer();
    }

    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

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
          `<div class="text-xs font-semibold text-sky-400">${lang === 'hu' ? 'Jelenlegi pozíciód' : 'Your Location'}</div>`
        );
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords, lang]);

  // Render Walking Route Polyline separately so marker clicks never redraw the route
  useEffect(() => {
    const routeGroup = routeLayerRef.current;
    if (!routeGroup) return;

    routeGroup.clearLayers();

    if (tourStops.length > 1) {
      const polylinePoints =
        streetRouteCoords.length > 0
          ? streetRouteCoords
          : tourStops.map((s) => s.bar.coords);

      // Ambient outer glow
      L.polyline(polylinePoints, {
        color: '#FDD835',
        weight: 10,
        opacity: 0.14,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'navigation-walking-halo',
      }).addTo(routeGroup);

      // Crisp dark casing
      L.polyline(polylinePoints, {
        color: '#09090B',
        weight: 6.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);

      // Primary gold walking path
      L.polyline(polylinePoints, {
        color: '#FDD835',
        weight: 3.5,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'navigation-walking-path',
      }).addTo(routeGroup);

      // Subtle step dashes
      L.polyline(polylinePoints, {
        color: '#111111',
        weight: 1.8,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 8',
        className: 'navigation-walking-steps',
      }).addTo(routeGroup);
    }
  }, [tourStops, streetRouteCoords]);

  // Render Tour & Discovery Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const tourBarIds = new Set(tourStops.map((s) => s.bar.id));
    const activeCoords: [number, number][] = [];

    // 1. Discovery catalog pins (only visible once a tour is generated, or if a single bar was explicitly selected)
    const hasGeneratedTour = tourStops.length > 0;
    const discoveryBars = hasGeneratedTour
      ? showAllBars
        ? allBars.filter((b) => !tourBarIds.has(b.id))
        : []
      : selectedBarId
        ? allBars.filter((b) => b.id === selectedBarId)
        : [];

    if (discoveryBars.length > 0) {
      discoveryBars.forEach((bar) => {
          const isSelected = selectedBarId === bar.id;
          const hitbox = 28;

          const icon = L.divIcon({
            className: 'custom-map-marker',
            html: getCatalogMarkerSvg(isSelected),
            iconSize: [hitbox, hitbox],
            iconAnchor: [hitbox / 2, hitbox / 2],
            popupAnchor: [0, -14],
          });

          const priceStr = '€'.repeat(bar.priceLevel);
          const googleMapsUrl = getGoogleMapsWalkingUrl(bar.name, bar.street, bar.coords);
          const appleMapsUrl = getAppleMapsWalkingUrl(bar.name, bar.street, bar.coords);
          const desc = lang === 'hu' ? bar.descriptionHu : bar.descriptionEn;

          const addButtonHtml = onAddBarToTour
            ? `<button type="button" data-add-bar-id="${escapeHtml(bar.id)}" class="w-full py-2 px-3 mb-2 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] text-xs font-bold rounded-xl transition-transform active:scale-[0.98] cursor-pointer text-center">+ ${escapeHtml(t.addToTour)}</button>`
            : '';

          const popupContent = `
            <div class="max-w-[248px]">
              <div class="flex items-center gap-1.5 text-[11px] text-white/50 font-medium mb-1 pr-6">
                <span class="truncate">${escapeHtml(bar.district)}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums text-white/70">${priceStr}</span>
              </div>
              <h4 class="font-bold text-[15px] text-white tracking-tight leading-snug mb-0.5">${escapeHtml(bar.name)}</h4>
              <p class="text-xs text-white/50 mb-2.5">${escapeHtml(bar.street)}</p>
              <div class="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 mb-3">
                <p class="text-[11.5px] text-white/75 line-clamp-3 leading-relaxed">${escapeHtml(desc)}</p>
              </div>
              ${addButtonHtml}
              <div class="grid grid-cols-2 gap-1.5">
                <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
                   class="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold rounded-lg transition-colors border border-white/10">
                  <span>Google</span><span aria-hidden="true">↗</span>
                </a>
                <a href="${appleMapsUrl}" target="_blank" rel="noopener noreferrer"
                   class="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold rounded-lg transition-colors border border-white/10">
                  <span>Apple</span><span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          `;

          const marker = L.marker(bar.coords, { icon, zIndexOffset: isSelected ? 400 : 0 })
            .addTo(markersGroup)
            .bindTooltip(escapeHtml(bar.name), {
              direction: 'top',
              offset: [0, -10],
              className: 'map-venue-tooltip',
            })
            .bindPopup(popupContent);

          marker.on('click', () => {
            onSelectBar(bar.id);
          });

          marker.on('popupopen', (e) => {
            const popupEl = e.popup.getElement();
            const addBtn = popupEl?.querySelector(`[data-add-bar-id="${CSS.escape(bar.id)}"]`);
            if (addBtn && onAddBarToTour) {
              addBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                onAddBarToTour(bar);
                marker.closePopup();
              });
            }
          });

          if (isSelected) {
            marker.openPopup();
          }
        });
    }

    // 2. Active Tour Stop Markers
    tourStops.forEach((stop, index) => {
      const bar = stop.bar;
      activeCoords.push(bar.coords);

      const isDone = stop.completed;
      const isSelected = selectedBarId === bar.id;
      const sizeW = isSelected ? 42 : 36;
      const sizeH = isSelected ? 52 : 44;

      const markerHtml = getTourStopMarkerSvg(index + 1, isDone, isSelected);

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: markerHtml,
        iconSize: [sizeW, sizeH],
        iconAnchor: [sizeW / 2, sizeH - 1],
        popupAnchor: [0, -sizeH + 4],
      });

      const priceStr = '€'.repeat(bar.priceLevel);
      const googleMapsUrl = getGoogleMapsWalkingUrl(bar.name, bar.street, bar.coords);
      const appleMapsUrl = getAppleMapsWalkingUrl(bar.name, bar.street, bar.coords);
      const challengeText = lang === 'hu' ? stop.challengeHu : stop.challengeEn;

      const popupContent = `
        <div class="max-w-[254px]">
          <div class="flex items-center gap-1.5 text-[11px] font-medium mb-1 pr-6">
            <span class="text-[#FDD835] font-bold tabular-nums">${index + 1}. ${escapeHtml(t.stopLabel)}</span>
            <span class="text-white/30" aria-hidden="true">·</span>
            <span class="text-white/60 tabular-nums">${priceStr}</span>
            ${isDone ? `<span class="text-white/30" aria-hidden="true">·</span><span class="text-emerald-400 font-semibold">${lang === 'hu' ? 'Teljesítve' : 'Done'}</span>` : ''}
          </div>
          <h4 class="font-bold text-[15px] text-white tracking-tight leading-snug mb-0.5">${escapeHtml(bar.name)}</h4>
          <p class="text-xs text-white/50 mb-2.5">${escapeHtml(bar.street)}</p>
          <div class="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 mb-3">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-[#FDD835]/90 mb-1">${escapeHtml(t.challengeTitle)}</div>
            <p class="text-xs text-white/85 leading-relaxed">${escapeHtml(challengeText)}</p>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
               class="flex items-center justify-center gap-1 py-2 px-2.5 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] text-[11px] font-bold rounded-xl transition-transform active:scale-[0.98] shadow-sm">
              <span>Google</span><span aria-hidden="true">↗</span>
            </a>
            <a href="${appleMapsUrl}" target="_blank" rel="noopener noreferrer"
               class="flex items-center justify-center gap-1 py-2 px-2.5 bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold rounded-xl transition-colors border border-white/10">
              <span>Apple (iOS)</span><span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      `;

      const marker = L.marker(bar.coords, {
        icon,
        zIndexOffset: isSelected ? 1000 : 600 + index,
      })
        .addTo(markersGroup)
        .bindTooltip(`${index + 1}. ${escapeHtml(bar.name)}`, {
          direction: 'top',
          offset: [0, -sizeH + 6],
          className: 'map-venue-tooltip',
        })
        .bindPopup(popupContent);

      marker.on('click', () => {
        onSelectBar(bar.id);
      });

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Only auto-fit tour bounds when the tour stops list itself changes (not on marker click)
    const tourSig = tourStops.map((s) => s.bar.id).join('|');
    if (activeCoords.length > 0 && tourSig !== lastTourSigRef.current) {
      lastTourSigRef.current = tourSig;
      const bounds = L.latLngBounds(activeCoords);
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 16,
      });
    } else if (activeCoords.length === 0) {
      lastTourSigRef.current = '';
    }
  }, [allBars, tourStops, selectedBarId, lang, onSelectBar, onAddBarToTour, t, showAllBars]);

  // Map control handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCenterBudapest = () => {
    mapInstanceRef.current?.flyTo([47.4980, 19.0620], 15, { duration: 0.7 });
  };

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
    <div className="relative w-full h-full bg-[#0A0A0A] overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-10" id="map" />

      {/* Subtle Edge Vignette so map integrates seamlessly into dark app frame */}
      <div
        className="absolute inset-0 pointer-events-none z-[200]"
        style={{
          background:
            'radial-gradient(circle at center, transparent 62%, rgba(10, 10, 10, 0.38) 100%)',
        }}
      />

      {/* Top-Left Modern Map Control Dock */}
      <div
        className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-[400] flex flex-col gap-2 transition-all duration-200 ${
          isObscured
            ? 'opacity-0 -translate-y-2 pointer-events-none invisible'
            : 'opacity-100 translate-y-0 visible'
        }`}
      >
        {onQuickGenerate && (
          <button
            type="button"
            onClick={onQuickGenerate}
            className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-3.5 py-2.5 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-bold rounded-xl shadow-[0_8px_24px_-4px_rgba(253,216,53,0.35)] text-xs tracking-tight transition-all active:scale-95 cursor-pointer min-h-[44px] min-w-[44px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title={
              tourStops.length > 0
                ? lang === 'hu'
                  ? 'Új túra generálása'
                  : 'Generate new tour'
                : lang === 'hu'
                  ? 'Túra generálás'
                  : 'Generate tour'
            }
            aria-label="Generate new tour"
          >
            <Route className="w-4 h-4 text-[#111111] stroke-[2.25] shrink-0" />
            <span className="hidden sm:inline">
              {tourStops.length > 0
                ? lang === 'hu'
                  ? 'Új túra'
                  : 'New Tour'
                : lang === 'hu'
                  ? 'Túra generálás'
                  : 'Generate'}
            </span>
          </button>
        )}

        {/* Unified Glassmorphic Map Utility Rail */}
        <div className="bg-[#111111]/88 backdrop-blur-xl border border-white/12 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-full flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 text-white/80 hover:text-[#FDD835] hover:bg-white/[0.06] transition-colors cursor-pointer min-h-[42px] min-w-[42px] text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10"
            title={t.zoomIn}
            aria-label={t.zoomIn}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t.zoomIn}</span>
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="w-full flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 text-white/80 hover:text-[#FDD835] hover:bg-white/[0.06] transition-colors cursor-pointer min-h-[42px] min-w-[42px] text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10"
            title={t.zoomOut}
            aria-label={t.zoomOut}
          >
            <Minus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t.zoomOut}</span>
          </button>

          <button
            type="button"
            onClick={onLocateUser}
            className="w-full flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 text-white/80 hover:text-[#FDD835] hover:bg-white/[0.06] transition-colors cursor-pointer min-h-[42px] min-w-[42px] text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10"
            title={t.locateMe}
            aria-label={t.locateMe}
          >
            <Crosshair className="w-4 h-4 text-[#FDD835] shrink-0" />
            <span className="hidden sm:inline">{t.locateMe}</span>
          </button>

          {tourStops.length > 0 && (
            <button
              type="button"
              onClick={handleFitTour}
              className="w-full flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 text-white/80 hover:text-[#FDD835] hover:bg-white/[0.06] transition-colors cursor-pointer min-h-[42px] min-w-[42px] text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10"
              title={t.fitTour}
              aria-label={t.fitTour}
            >
              <Maximize2 className="w-4 h-4 text-[#FDD835] shrink-0" />
              <span className="hidden sm:inline">{t.fitTour}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCenterBudapest}
            className="w-full flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 text-white/80 hover:text-[#FDD835] hover:bg-white/[0.06] transition-colors cursor-pointer min-h-[42px] min-w-[42px] text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10"
            title={t.centerBudapest}
            aria-label={t.centerBudapest}
          >
            <Navigation className="w-4 h-4 text-[#FDD835] shrink-0" />
            <span className="hidden sm:inline">{t.centerBudapest}</span>
          </button>
        </div>
      </div>

      {/* Top-Right Layer Filter Segmented Control + Live Route Loading Indicator */}
      {tourStops.length > 0 && (
        <div
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-[400] flex items-center gap-2 transition-all duration-200 ${
            isObscured
              ? 'opacity-0 -translate-y-2 pointer-events-none invisible'
              : 'opacity-100 translate-y-0 visible'
          }`}
        >
          {isRoutingLoading && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#111111]/88 backdrop-blur-xl border border-white/12 rounded-xl text-xs font-medium text-white/75 shadow-xl">
              <Loader2 className="w-3.5 h-3.5 text-[#FDD835] animate-spin" />
              <span className="whitespace-nowrap">{t.routingCalculating}</span>
            </div>
          )}

          <div
            className="flex items-center gap-1 p-1 bg-[#111111]/88 backdrop-blur-xl border border-white/12 rounded-xl shadow-2xl"
            role="group"
            aria-label="Map layer filter"
          >
            <button
              type="button"
              onClick={() => setShowAllBars(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[34px] whitespace-nowrap ${
                showAllBars
                  ? 'bg-[#FDD835] text-[#111111] shadow-sm'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{t.showAllSpots}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAllBars(false)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[34px] whitespace-nowrap ${
                !showAllBars
                  ? 'bg-[#FDD835] text-[#111111] shadow-sm'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              {t.tourSpotsOnly}
            </button>
          </div>
        </div>
      )}

      {/* Bottom-Left Desktop Route Telemetry Bar */}
      {tourStops.length > 0 && (
        <div
          className={`hidden md:flex absolute bottom-6 left-4 z-[400] bg-[#111111]/90 backdrop-blur-xl border border-white/12 px-4 py-2.5 rounded-2xl items-center gap-4 shadow-2xl transition-all duration-200 ${
            isObscured
              ? 'opacity-0 translate-y-2 pointer-events-none invisible'
              : 'opacity-100 translate-y-0 visible'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-white/85 font-medium tabular-nums whitespace-nowrap">
            <span className="font-bold text-[#FDD835]">
              {tourStops.length} {t.hudBars}
            </span>
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            <span>{formattedDistance}</span>
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            <span className="text-white/65">
              ~{totalWalkMinutes} {t.mins}
            </span>
          </div>

          {onQuickGenerate && (
            <>
              <div className="h-4 w-px bg-white/12" />
              <button
                type="button"
                onClick={onQuickGenerate}
                className="bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] px-3.5 py-1.5 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
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
