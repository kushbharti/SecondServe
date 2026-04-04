export type ListingStatus = 'active' | 'claimed' | 'picked_up' | 'delivered' | 'expired';

export type FoodType = 'prepared' | 'produce' | 'baked_goods' | 'dairy' | 'other';

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'halal'
  | 'kosher';

export type Allergen =
  | 'peanuts'
  | 'tree_nuts'
  | 'dairy'
  | 'eggs'
  | 'soy'
  | 'wheat'
  | 'fish'
  | 'shellfish';

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Listing {
  id: string;
  donorId: string;
  title: string;
  description: string;
  foodType: FoodType;
  quantity: number;
  estimatedMeals: number;
  dietaryTags: DietaryTag[];
  allergens: Allergen[];
  photos: string[]; // base64 or URLs
  pickupLocation: Location;
  pickupStart: string; // ISO timestamps
  pickupEnd: string;
  expiresAt: string;
  createdAt: string;
  status: ListingStatus;
  claimedByRecipientId?: string;
}

