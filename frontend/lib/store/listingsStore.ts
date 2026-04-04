'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing, ListingStatus } from '@/types/listing';
import { mockListings } from '@/lib/mock-data/listings';
import { v4 as uuid } from 'uuid';

interface ListingsState {
  listings: Listing[];
  createListing: (input: Omit<Listing, 'id' | 'createdAt' | 'status'>) => Listing;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  claimListing: (id: string, recipientId: string) => void;
}

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: mockListings,
      createListing: input => {
        const listing: Listing = {
          ...input,
          id: uuid(),
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        set({ listings: [listing, ...get().listings] });
        return listing;
      },
      updateListingStatus: (id, status) => {
        set({
          listings: get().listings.map(l =>
            l.id === id
              ? {
                  ...l,
                  status
                }
              : l
          )
        });
      },
      claimListing: (id, recipientId) => {
        set({
          listings: get().listings.map(l =>
            l.id === id
              ? {
                  ...l,
                  status: 'claimed',
                  claimedByRecipientId: recipientId
                }
              : l
          )
        });
      }
    }),
    {
      name: 'frc-listings'
    }
  )
);

