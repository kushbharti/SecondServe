'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Delivery, DeliveryStatus } from '@/types/delivery';
import { mockDeliveries } from '@/lib/mock-data/deliveries';

interface DeliveriesState {
  deliveries: Delivery[];
  acceptDelivery: (id: string, driverId: string) => void;
  updateStatus: (id: string, status: DeliveryStatus) => void;
}

export const useDeliveriesStore = create<DeliveriesState>()(
  persist(
    (set, get) => ({
      deliveries: mockDeliveries,
      acceptDelivery: (id, driverId) => {
        set({
          deliveries: get().deliveries.map(d =>
            d.id === id
              ? {
                  ...d,
                  driverId,
                  status: 'accepted',
                  acceptedAt: new Date().toISOString()
                }
              : d
          )
        });
      },
      updateStatus: (id, status) => {
        const timestampField =
          status === 'pickup_confirmed'
            ? 'pickupConfirmedAt'
            : status === 'delivered'
            ? 'deliveredAt'
            : undefined;

        set({
          deliveries: get().deliveries.map(d =>
            d.id === id
              ? {
                  ...d,
                  status,
                  ...(timestampField
                    ? { [timestampField]: new Date().toISOString() }
                    : {})
                }
              : d
          )
        });
      }
    }),
    {
      name: 'frc-deliveries'
    }
  )
);

