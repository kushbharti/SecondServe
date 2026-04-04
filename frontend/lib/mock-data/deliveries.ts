import type { Delivery } from '@/types/delivery';

const now = Date.now();

export const mockDeliveries: Delivery[] = [
  {
    id: 'delivery-1',
    listingId: 'listing-2',
    donorId: 'donor-1',
    recipientId: 'recipient-1',
    driverId: undefined,
    status: 'available',
    pickupCode: '123456',
    dropoffCode: '654321',
    createdAt: new Date(now - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'delivery-2',
    listingId: 'listing-3',
    donorId: 'donor-1',
    recipientId: 'recipient-1',
    driverId: 'driver-1',
    status: 'delivered',
    pickupCode: '123456',
    dropoffCode: '654321',
    createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(now - 4.5 * 60 * 60 * 1000).toISOString(),
    pickupConfirmedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(now - 3.5 * 60 * 60 * 1000).toISOString(),
    distanceKm: 8.2,
    durationMinutes: 32
  }
];

