export type Language = 'hu' | 'en';

export type PubCategory = 
  | 'ruin_bar'
  | 'craft_beer'
  | 'underground'
  | 'cocktail_lounge'
  | 'garden_patio'
  | 'party_complex';

export interface Bar {
  id: string;
  name: string;
  street: string;
  district: string;
  coords: [number, number]; // [lat, lng]
  category: PubCategory;
  priceLevel: 1 | 2 | 3; // 1 = budget (€), 2 = moderate (€€), 3 = premium (€€€)
  rating: number;
  openHours?: string;
  descriptionHu: string;
  descriptionEn: string;
  funFactHu?: string;
  funFactEn?: string;
  tags: string[];
  isCustom?: boolean;
}

export interface TourStop {
  id: string;
  bar: Bar;
  challengeHu: string;
  challengeEn: string;
  completed: boolean;
  completedAt?: number;
}

export interface TourGenerationOptions {
  stopCount: number; // 2 - 8
  category?: PubCategory | 'all';
  priceLevel?: number | 'all';
  startFromLocation?: boolean;
  userCoords?: [number, number] | null;
  startHub?: 'random' | 'deak' | 'blaha' | 'oktogon' | 'astoria';
}

export interface SavedTourData {
  timestamp: number;
  stops: TourStop[];
}
