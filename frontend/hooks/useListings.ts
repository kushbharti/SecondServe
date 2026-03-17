'use client';

import { useListingsStore } from '@/lib/store/listingsStore';

export function useListings() {
  const store = useListingsStore();
  return store;
}

