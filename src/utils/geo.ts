import { Bar, TourStop, TourGenerationOptions } from '../types';
import { getRandomChallenge } from '../data/challenges';

// Calculate distance in kilometers between two lat/lng coordinates (Haversine formula)
export function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total walking distance of a tour in meters and formatted string
export function calculateTourStats(stops: TourStop[]) {
  if (stops.length < 2) {
    return { totalDistanceMeters: 0, totalWalkMinutes: 0 };
  }

  let totalDistanceKm = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    totalDistanceKm += getDistanceKm(stops[i].bar.coords, stops[i + 1].bar.coords);
  }

  // Account for real street grid routing (manhattan/zigzag multiplier ~1.25x of straight line)
  const realWalkingDistanceKm = totalDistanceKm * 1.25;
  const totalDistanceMeters = Math.round(realWalkingDistanceKm * 1000);
  
  // Average pedestrian speed ~4.8 km/h = 80 meters/min + buffer
  const totalWalkMinutes = Math.max(1, Math.round(totalDistanceMeters / 75));

  return { totalDistanceMeters, totalWalkMinutes };
}

// Generate smart tour with nearest-neighbor traveling path
export function generateTourRoute(
  allBars: Bar[],
  options: TourGenerationOptions,
  lang: 'hu' | 'en'
): TourStop[] {
  let pool = [...allBars];

  // Filter by category if specified
  if (options.category && options.category !== 'all') {
    const matching = pool.filter((b) => b.category === options.category);
    if (matching.length >= 2) {
      pool = matching;
    }
  }

  // Filter by price level if specified
  if (options.priceLevel && options.priceLevel !== 'all') {
    const matching = pool.filter((b) => b.priceLevel === options.priceLevel);
    if (matching.length >= 2) {
      pool = matching;
    }
  }

  const targetCount = Math.min(options.stopCount || 4, pool.length);
  const selectedBars: Bar[] = [];

  // Pick first bar based on options
  if (options.startFromLocation && options.userCoords) {
    // Sort by proximity to user
    pool.sort(
      (a, b) =>
        getDistanceKm(options.userCoords!, a.coords) -
        getDistanceKm(options.userCoords!, b.coords)
    );
    selectedBars.push(pool.shift()!);
  } else {
    // Pick random starter
    const randomIndex = Math.floor(Math.random() * pool.length);
    selectedBars.push(pool.splice(randomIndex, 1)[0]);
  }

  // Add next closest stops
  while (selectedBars.length < targetCount && pool.length > 0) {
    const lastBar = selectedBars[selectedBars.length - 1];
    pool.sort(
      (a, b) =>
        getDistanceKm(lastBar.coords, a.coords) -
        getDistanceKm(lastBar.coords, b.coords)
    );
    // Take the closest or 2nd closest to add small organic variety
    const pickIndex = pool.length > 1 && Math.random() < 0.25 ? 1 : 0;
    selectedBars.push(pool.splice(pickIndex, 1)[0]);
  }

  // Build TourStop objects with random challenges
  return selectedBars.map((bar, index) => {
    const challenge = getRandomChallenge(lang);
    return {
      id: `stop-${bar.id}-${index}-${Date.now()}`,
      bar,
      challengeHu: challenge.hu,
      challengeEn: challenge.en,
      completed: false,
    };
  });
}

// Generate multi-stop Google Maps URL
export function generateGoogleMapsRouteUrl(stops: TourStop[]): string {
  if (stops.length === 0) return 'https://www.google.com/maps';
  if (stops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${stops[0].bar.name}, ${stops[0].bar.street}, Budapest`
    )}`;
  }

  const origin = encodeURIComponent(`${stops[0].bar.name}, ${stops[0].bar.street}, Budapest`);
  const destination = encodeURIComponent(
    `${stops[stops.length - 1].bar.name}, ${stops[stops.length - 1].bar.street}, Budapest`
  );
  
  const waypoints = stops
    .slice(1, stops.length - 1)
    .map((s) => encodeURIComponent(`${s.bar.name}, ${s.bar.street}, Budapest`))
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  return url;
}

// Format clipboard share text
export function formatTourShareText(stops: TourStop[], lang: 'hu' | 'en'): string {
  const { totalDistanceMeters, totalWalkMinutes } = calculateTourStats(stops);
  const distanceStr =
    totalDistanceMeters >= 1000
      ? `${(totalDistanceMeters / 1000).toFixed(1)} km`
      : `${totalDistanceMeters} m`;

  if (lang === 'hu') {
    let text = `🍻 RoadToLoad – Budapest Kocsmatúra Tervezet:\n`;
    text += `📍 ${stops.length} megálló • 🚶‍♂️ ${distanceStr} (~${totalWalkMinutes} perc séta)\n\n`;
    stops.forEach((s, idx) => {
      text += `${idx + 1}. 🍺 ${s.bar.name}\n   📍 ${s.bar.street}\n   🎯 Kihívás: "${s.challengeHu}"\n\n`;
    });
    text += `🗺️ Térkép & részletek: https://roadtoload.hu\nEgészségetekre!`;
    return text;
  } else {
    let text = `🍻 RoadToLoad – Budapest Pub Crawl Route:\n`;
    text += `📍 ${stops.length} stops • 🚶‍♂️ ${distanceStr} (~${totalWalkMinutes} min walk)\n\n`;
    stops.forEach((s, idx) => {
      text += `${idx + 1}. 🍺 ${s.bar.name}\n   📍 ${s.bar.street}\n   🎯 Challenge: "${s.challengeEn}"\n\n`;
    });
    text += `🗺️ Full map & tracker: https://roadtoload.hu\nCheers!`;
    return text;
  }
}
