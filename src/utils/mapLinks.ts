import { Bar, TourStop } from '../types';

/**
 * Checks if the current browser environment is running on iOS, iPadOS, or macOS.
 */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /iPad|iPhone|iPod|Macintosh|Mac OS X/i.test(ua) && !('MSStream' in window);
}

/**
 * Generates Google Maps walking directions URL for a single venue.
 */
export function getGoogleMapsWalkingUrl(name: string, street: string, coords?: [number, number]): string {
  const destination = coords 
    ? `${coords[0]},${coords[1]}` 
    : `${name}, ${street}, Budapest`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;
}

/**
 * Generates Apple Maps (iOS / macOS Térképek) walking directions URL for a single venue.
 */
export function getAppleMapsWalkingUrl(name: string, street: string, coords?: [number, number]): string {
  const query = encodeURIComponent(`${name}, ${street}, Budapest`);
  if (coords) {
    return `https://maps.apple.com/?daddr=${coords[0]},${coords[1]}&q=${query}&dirflg=w`;
  }
  return `https://maps.apple.com/?daddr=${query}&dirflg=w`;
}

/**
 * Generates multi-stop Google Maps directions link for full tour.
 */
export function getMultiStopGoogleMapsUrl(stops: TourStop[]): string {
  if (stops.length === 0) return 'https://maps.google.com';
  if (stops.length === 1) {
    return getGoogleMapsWalkingUrl(stops[0].bar.name, stops[0].bar.street, stops[0].bar.coords);
  }

  const origin = encodeURIComponent(`${stops[0].bar.name}, ${stops[0].bar.street}, Budapest`);
  const destination = encodeURIComponent(`${stops[stops.length - 1].bar.name}, ${stops[stops.length - 1].bar.street}, Budapest`);
  const waypoints = stops
    .slice(1, -1)
    .map((s) => encodeURIComponent(`${s.bar.name}, ${s.bar.street}, Budapest`))
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  return url;
}

/**
 * Generates Apple Maps link for full tour destination.
 */
export function getMultiStopAppleMapsUrl(stops: TourStop[]): string {
  if (stops.length === 0) return 'https://maps.apple.com';
  const first = stops[0].bar;
  return getAppleMapsWalkingUrl(first.name, first.street, first.coords);
}
