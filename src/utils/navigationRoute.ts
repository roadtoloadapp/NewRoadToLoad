// High-precision pedestrian walking route fetcher using OpenStreetMap pedestrian routing
const routeCache = new Map<string, [number, number][]>();

/**
 * Calculates Euclidean distance in km between two coords
 */
function getEuclideanDistanceKm(c1: [number, number], c2: [number, number]): number {
  const dLat = (c2[0] - c1[0]) * 111.32;
  const dLng = (c2[1] - c1[1]) * 111.32 * Math.cos((c1[0] * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Fetches turn-by-turn pedestrian walking route between two consecutive points
 */
async function fetchLegPedestrianRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  const legKey = `${start[0].toFixed(5)},${start[1].toFixed(5)}_${end[0].toFixed(5)},${end[1].toFixed(5)}`;
  if (routeCache.has(legKey)) {
    return routeCache.get(legKey)!;
  }

  const coordStr = `${start[1]},${start[0]};${end[1]},${end[0]}`;
  const straightDistKm = getEuclideanDistanceKm(start, end);

  // Endpoints dedicated to pedestrian footways, plazas, parks, and walking zones
  const endpoints = [
    `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordStr}?overview=full&geometries=geojson&continue_straight=false`,
    `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=full&geometries=geojson`,
    `https://router.project-osrm.org/route/v1/walking/${coordStr}?overview=full&geometries=geojson`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (!res.ok) continue;

      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeDistKm = (route.distance || 0) / 1000;

        // Sanity check: if walking route detours more than 3.5x straight line, ignore car detours
        if (straightDistKm > 0.05 && routeDistKm > straightDistKm * 3.5) {
          continue;
        }

        const geojsonCoords: [number, number][] = route.geometry.coordinates;
        if (geojsonCoords && geojsonCoords.length > 0) {
          const latLngs: [number, number][] = geojsonCoords.map(([lng, lat]) => [lat, lng]);
          
          // Ensure exact start and end snap to the actual bar pins
          const completeLeg: [number, number][] = [start, ...latLngs, end];
          routeCache.set(legKey, completeLeg);
          return completeLeg;
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // Fallback: direct connection
  const directLeg: [number, number][] = [start, end];
  routeCache.set(legKey, directLeg);
  return directLeg;
}

/**
 * Fetches turn-by-turn street walking navigation geometry for a sequence of stops.
 * Seamlessly stitches walking legs together so the path connects each stop directly.
 */
export async function fetchStreetWalkingRoute(
  stopsCoords: [number, number][]
): Promise<[number, number][]> {
  if (stopsCoords.length < 2) return stopsCoords;

  const fullTourKey = stopsCoords
    .map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`)
    .join(';');

  if (routeCache.has(fullTourKey)) {
    return routeCache.get(fullTourKey)!;
  }

  // 1. Try full multi-stop pedestrian route first
  const coordString = stopsCoords
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';');

  const multiEndpoints = [
    `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordString}?overview=full&geometries=geojson&continue_straight=false`,
    `https://router.project-osrm.org/route/v1/foot/${coordString}?overview=full&geometries=geojson`
  ];

  for (const url of multiEndpoints) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;

      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const geojsonCoords: [number, number][] = data.routes[0].geometry.coordinates;
        if (geojsonCoords && geojsonCoords.length > 0) {
          const latLngs: [number, number][] = geojsonCoords.map(([lng, lat]) => [lat, lng]);
          const fullRoute = [stopsCoords[0], ...latLngs, stopsCoords[stopsCoords.length - 1]];
          routeCache.set(fullTourKey, fullRoute);
          return fullRoute;
        }
      }
    } catch {
      // Fallback to per-leg routing
    }
  }

  // 2. Fallback: compute per-leg pedestrian segments in parallel for maximum reliability
  try {
    const legPromises: Promise<[number, number][]>[] = [];
    for (let i = 0; i < stopsCoords.length - 1; i++) {
      legPromises.push(fetchLegPedestrianRoute(stopsCoords[i], stopsCoords[i + 1]));
    }

    const legs = await Promise.all(legPromises);
    const combined: [number, number][] = [];
    legs.forEach((leg, index) => {
      if (index === 0) {
        combined.push(...leg);
      } else {
        // Skip first point of subsequent leg to avoid duplicate vertex
        combined.push(...leg.slice(1));
      }
    });

    if (combined.length > 0) {
      routeCache.set(fullTourKey, combined);
      return combined;
    }
  } catch {
    // Fallback to direct coords
  }

  return stopsCoords;
}
