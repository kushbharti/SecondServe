'use client';

import { useEffect, useState, useMemo } from 'react';
import { recipientApi } from '@/lib/recipient';
import { FoodListing } from '@/lib/donor';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import Link from 'next/link';

export function MapSection() {
  const [activeListings, setActiveListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await recipientApi.getAvailableListings();
        setActiveListings(data);
      } catch (error) {
        console.error("Failed to fetch available listings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  // Get unique locations - Mocked for now since backend doesn't send lat/lng yet
  // We will mostly use address string.
  const locations = useMemo(() => {
    const uniqueLocations = new Map();
    activeListings.forEach(listing => {
      // Mock coordinates if not present
      const key = listing.pickup_address;
      if (!uniqueLocations.has(key)) {
        uniqueLocations.set(key, {
            address: listing.pickup_address,
            count: 0
        });
      }
      uniqueLocations.get(key).count += 1;
    });
    return Array.from(uniqueLocations.values());
  }, [activeListings]);

  if (loading) {
      return <div>Loading available food...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Food Pickup Locations</h3>
          <p className="text-xs text-muted-foreground">
            Interactive map showing available food items near you
          </p>
        </div>
        <Link
          href="/recipient/browse"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-smooth hover:bg-primary/90 hover-lift"
        >
          <Navigation className="h-4 w-4" />
          View All Listings
        </Link>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {/* Map placeholder - In production, this would be a real map component */}
        <div className="relative h-64 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-primary/50" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Map View
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeListings.length} active listings available
              </p>
            </div>
          </div>
          
          {/* Simulated map markers - Removed pulse implementation for simplicity on address-only data */}
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {activeListings.length} Available Food Items
              </p>
              <p className="text-xs text-muted-foreground">
                {locations.length} pickup locations
              </p>
            </div>
            <Link
              href="/recipient/browse"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Explore map
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {activeListings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Recent Listings</p>
          <div className="space-y-2">
            {activeListings.slice(0, 3).map(listing => (
              <div
                key={listing.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-smooth hover:border-primary-200 hover:shadow-sm"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{listing.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{listing.pickup_address}</span>
                  </div>
                </div>
                {/* 
                <Link
                  href={`/recipient/listings/${listing.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View Details →
                </Link>
                */}
                <button 
                    onClick={async () => {
                        try {
                            await recipientApi.requestListing(listing.id);
                            alert("Request sent!");
                            window.location.reload();
                        } catch(e) {
                            alert("Failed to request");
                        }
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                >
                    Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
