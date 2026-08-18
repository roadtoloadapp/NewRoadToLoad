import { Bar } from '../types';
import { BARS_DISTRICT_7_AND_6 } from './bars_district7_6';
import { BARS_DISTRICT_5_8_9 } from './bars_district5_8_9';
import { BARS_BUDA_AND_OUTER } from './bars_buda_danube';
import { BARS_MORE_PEST } from './bars_more_pest';
import { BARS_MORE_BUDA_AND_CRAFT } from './bars_more_buda_craft';
import { BARS_PART6_PEST_EXPANDED } from './bars_part6_pest_expanded';
import { BARS_PART7_BUDA_EXPANDED } from './bars_part7_buda_expanded';
import { BARS_PART8_UNDERGROUND_CULTURE } from './bars_part8_underground_culture';
import { BARS_PART9_CLASSIC_SOERUEZOEK } from './bars_part9_classic_soeruezoek';
import { BARS_PART10_OUTER_DISTRICTS } from './bars_part10_outer_districts';
import { BARS_PART11_ULTIMATE_COLLECTION } from './bars_part11_ultimate_collection';
import { BARS_PART12_GRAND_BUDAPEST } from './bars_part12_grand_budapest';
import { BARS_PART13_LEGENDARY_SPOTS } from './bars_part13_legendary_spots';
import { BARS_PART14_CRAFT_DISTRICTS } from './bars_part14_craft_districts';
import { BARS_PART15_HISTORIC_TAVERNS } from './bars_part15_historic_taverns';

function deduplicateBars(bars: Bar[]): Bar[] {
  const seen = new Set<string>();
  return bars.filter(bar => {
    if (!bar || !bar.id || seen.has(bar.id)) return false;
    seen.add(bar.id);
    return true;
  });
}

// Merge all verified, actively operating Budapest pubs & venues (250+ total across all districts)
export const INITIAL_BARS: Bar[] = deduplicateBars([
  ...BARS_DISTRICT_7_AND_6,
  ...BARS_DISTRICT_5_8_9,
  ...BARS_BUDA_AND_OUTER,
  ...BARS_MORE_PEST,
  ...BARS_MORE_BUDA_AND_CRAFT,
  ...BARS_PART6_PEST_EXPANDED,
  ...BARS_PART7_BUDA_EXPANDED,
  ...BARS_PART8_UNDERGROUND_CULTURE,
  ...BARS_PART9_CLASSIC_SOERUEZOEK,
  ...BARS_PART10_OUTER_DISTRICTS,
  ...BARS_PART11_ULTIMATE_COLLECTION,
  ...BARS_PART12_GRAND_BUDAPEST,
  ...BARS_PART13_LEGENDARY_SPOTS,
  ...BARS_PART14_CRAFT_DISTRICTS,
  ...BARS_PART15_HISTORIC_TAVERNS
]);

// Expanded city hubs across Budapest districts for flexible tour start points
export const CITY_HUBS = [
  { id: 'deak', name: 'Deák Ferenc tér (Belváros)', coords: [47.4979, 19.0541] as [number, number] },
  { id: 'astoria', name: 'Astoria (V./VII./VIII.)', coords: [47.4942, 19.0598] as [number, number] },
  { id: 'blaha', name: 'Blaha Lujza tér (VII./VIII.)', coords: [47.4960, 19.0699] as [number, number] },
  { id: 'oktogon', name: 'Oktogon (VI. kerület)', coords: [47.5057, 19.0631] as [number, number] },
  { id: 'kalvin', name: 'Kálvin tér / Bakáts (V./VIII./IX.)', coords: [47.4895, 19.0610] as [number, number] },
  { id: 'moricz', name: 'Móricz / Bocskai út (XI. Újbuda)', coords: [47.4750, 19.0475] as [number, number] },
  { id: 'corvin', name: 'Corvin-negyed / A Grund (VIII./IX.)', coords: [47.4860, 19.0700] as [number, number] },
  { id: 'szell', name: 'Széll Kálmán tér (II. Buda)', coords: [47.5070, 19.0250] as [number, number] },
  { id: 'nyugati', name: 'Nyugati tér (VI./XIII.)', coords: [47.5105, 19.0560] as [number, number] },
  { id: 'ors', name: 'Örs vezér tere / Kerepesi út (XIV./X. Zugló)', coords: [47.5030, 19.1370] as [number, number] },
  { id: 'romai', name: 'Római-part (III. Óbuda)', coords: [47.5760, 19.0610] as [number, number] }
];
