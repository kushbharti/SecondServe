export type DeliveryStatus = 'available' | 'accepted' | 'pickup_confirmed' | 'in_transit' | 'delivered';

export interface Delivery {
  id: string;
  listingId: string;
  donorId: string;
  recipientId: string;
  driverId?: string;
  status: DeliveryStatus;
  pickupCode: string;
  dropoffCode: string;
  createdAt: string;
  acceptedAt?: string;
  pickupConfirmedAt?: string;
  deliveredAt?: string;
  distanceKm?: number;
  durationMinutes?: number;
}

