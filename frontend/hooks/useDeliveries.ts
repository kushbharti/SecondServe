'use client';

import { useDeliveriesStore } from '@/lib/store/deliveriesStore';

export function useDeliveries() {
  const store = useDeliveriesStore();
  return store;
}

