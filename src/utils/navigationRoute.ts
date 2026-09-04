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
 * Clean redundant points and remove sharp micro-spikes/backtracking from route
 */
function cleanRouteCoordinates(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;

  const cleaned: [number, number][] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = cleaned[cleaned.length - 1];
    const curr = points[i];
    const dist = getEuclideanDistanceKm(prev, curr);

    // Filter out redundant points closer than 2.5 meters (unless it's the last point)
    if (dist < 0.0025 && i < points.length - 1) {
      continue;
    }

    cleaned.push(curr);
  }

  // Remove sharp 180° backtracking spikes (detour to dead end and immediate return)
  if (cleaned.length > 3) {
    const smoothed: [number, number][] = [cleaned[0]];
    for (let i = 1; i < cleaned.length - 1; i++) {
      const p0 = smoothed[smoothed.length - 1];
      const p1 = cleaned[i];
      const p2 = cleaned[i + 1];

      const d1 = getEuclideanDistanceKm(p0, p1);
      const d2 = getEuclideanDistanceKm(p1, p2);
      const dDirect = getEuclideanDistanceKm(p0, p2);

      // If p1 is a tiny detour spike (< 15m) where returning to p2 is nearly zero direct distance
      if (d1 < 0.015 && d2 < 0.015 && dDirect < 0.004) {
        continue; // skip the spike point
      }
      smoothed.push(p1);
    }
    smoothed.push(cleaned[cleaned.length - 1]);
    return smoothed;
  }

  return cleaned;
}

/**
 * Generates an orthogonal street-aligned fallback between two nearby Budapest points
 * when internet routing servers are unreachable, avoiding diagonal building crossings.
 */
function generateStreetGridFallback(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const distKm = getEuclideanDistanceKm(start, end);
  if (distKm > 1.2) {
    // For long distances, return direct
    return [start, end];
  }

  // Budapest District VII / Inner City street grid runs at roughly -48° / +42° rotation.
  // Using a 2-segment street corner approximation follows the avenues & cross-streets.
  const midLat = start[0] + (end[0] - start[0]) * 0.5;
  const midLng = start[1] + (end[1] - start[1]) * 0.5;

  const cornerPoint: [number, number] = [start[0], end[1]];
  const altCornerPoint: [number, number] = [end[0], start[1]];

  // Pick corner closer to realistic street centroid
  const corner = Math.abs(midLat - cornerPoint[0]) < Math.abs(midLng - cornerPoint[1])
    ? cornerPoint
    : altCornerPoint;

  return [start, corner, end];
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

  // Dedicated OpenStreetMap Pedestrian walking endpoints (NOT driving!)
  const endpoints = [
    `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordStr}?overview=full&geometries=geojson`,
    `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=full&geometries=geojson`,
    `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordStr}?overview=full&geometries=geojson&continue_straight=false`,
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

        // Sanity check: if walking route detours more than 3.5x straight line, ignore
        if (straightDistKm > 0.05 && routeDistKm > straightDistKm * 3.5) {
          continue;
        }

        const geojsonCoords: [number, number][] = route.geometry.coordinates;
        if (geojsonCoords && geojsonCoords.length > 0) {
          const latLngs: [number, number][] = geojsonCoords.map(([lng, lat]) => [lat, lng]);
          
          // Ensure exact start and end snap to the actual bar pins
          const rawLeg: [number, number][] = [start, ...latLngs, end];
          const completeLeg = cleanRouteCoordinates(rawLeg);
          routeCache.set(legKey, completeLeg);
          return completeLeg;
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // Graceful fallback: street-aligned grid path
  const fallbackLeg = generateStreetGridFallback(start, end);
  routeCache.set(legKey, fallbackLeg);
  return fallbackLeg;
}

/**
 * Fetches turn-by-turn street walking navigation geometry for a sequence of stops.
 * Seamlessly stitches walking legs together so the path connects each stop cleanly.
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

  // 1. Try multi-stop foot navigation call first
  const coordString = stopsCoords
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';');

  const multiEndpoints = [
    `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordString}?overview=full&geometries=geojson`,
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
          const fullRoute = cleanRouteCoordinates([
            stopsCoords[0],
            ...latLngs,
            stopsCoords[stopsCoords.length - 1],
          ]);
          routeCache.set(fullTourKey, fullRoute);
          return fullRoute;
        }
      }
    } catch {
      // Fallback to per-leg routing
    }
  }

  // 2. Parallel leg-by-leg routing
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
      const finalClean = cleanRouteCoordinates(combined);
      routeCache.set(fullTourKey, finalClean);
      return finalClean;
    }
  } catch {
    // Fallback to direct coords
  }

  return stopsCoords;
}
