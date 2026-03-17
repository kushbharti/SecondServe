import type { Listing } from '@/types/listing';

const now = Date.now();

export const mockListings: Listing[] = [
  {
    id: 'listing-1',
    donorId: 'donor-1',
    title: 'Roasted vegetable & grain trays',
    description:
      'Four hotel pans of roasted seasonal vegetables with quinoa and brown rice. Prepared this afternoon, ideal for dinner service.',
    foodType: 'prepared',
    quantity: 40,
    estimatedMeals: 80,
    dietaryTags: ['vegetarian', 'vegan', 'dairy_free', 'gluten_free'],
    allergens: [],
    photos: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80'
    ],
    pickupLocation: {
      address: '123 Green St, San Francisco, CA 94123',
      latitude: 37.7993,
      longitude: -122.436
    },
    pickupStart: new Date(now + 60 * 60 * 1000).toISOString(),
    pickupEnd: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'listing-2',
    donorId: 'donor-1',
    title: 'Assorted bakery rescue box',
    description:
      'Three crates of yesterday’s artisan bread, rolls, and pastries. Perfect for breakfast programs and community meals.',
    foodType: 'baked_goods',
    quantity: 60,
    estimatedMeals: 90,
    dietaryTags: [],
    allergens: ['wheat', 'eggs', 'dairy'],
    photos: [
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80'
    ],
    pickupLocation: {
      address: '455 Market St, San Francisco, CA 94105',
      latitude: 37.7908,
      longitude: -122.399
    },
    pickupStart: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
    pickupEnd: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 10 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    status: 'claimed',
    claimedByRecipientId: 'recipient-1'
  },
  {
    id: 'listing-3',
    donorId: 'donor-1',
    title: 'Fresh produce crates',
    description:
      'Mixed seasonal produce: leafy greens, tomatoes, apples, and root vegetables. Ready for distribution today.',
    foodType: 'produce',
    quantity: 120,
    estimatedMeals: 150,
    dietaryTags: ['vegan', 'gluten_free'],
    allergens: [],
    photos: [
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80'
    ],
    pickupLocation: {
      address: '800 Market St, San Francisco, CA 94102',
      latitude: 37.784,
      longitude: -122.4075
    },
    pickupStart: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    pickupEnd: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    claimedByRecipientId: 'recipient-1'
  },
  {
    id: 'listing-4',
    donorId: 'donor-1',
    title: 'Dairy and eggs surplus',
    description:
      'Cases of milk, yogurt, and eggs approaching sell-by date. Ideal for breakfast programs and community kitchens.',
    foodType: 'dairy',
    quantity: 80,
    estimatedMeals: 100,
    dietaryTags: [],
    allergens: ['dairy', 'eggs'],
    photos: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'
    ],
    pickupLocation: {
      address: '2000 4th St, San Francisco, CA 94158',
      latitude: 37.7679,
      longitude: -122.392
    },
    pickupStart: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
    pickupEnd: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'listing-5',
    donorId: 'donor-1',
    title: 'Pantry staples mixed pallets',
    description:
      'Shelf-stable items including rice, beans, canned vegetables, and pasta. Great for stocking community pantries.',
    foodType: 'other',
    quantity: 200,
    estimatedMeals: 220,
    dietaryTags: ['vegan'],
    allergens: ['wheat'],
    photos: [
      'https://images.unsplash.com/photo-1580914521208-4f0a87f1c9a8?auto=format&fit=crop&w=900&q=80'
    ],
    pickupLocation: {
      address: '999 Brannan St, San Francisco, CA 94103',
      latitude: 37.7719,
      longitude: -122.403
    },
    pickupStart: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    pickupEnd: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    status: 'expired'
  }
];

