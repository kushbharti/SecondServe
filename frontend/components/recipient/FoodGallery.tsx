"use client";
import { useEffect, useState } from "react";
import { recipientApi } from "@/lib/recipient";
import { FoodListing } from "@/lib/donor";
import {
  Image as ImageIcon,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

export function FoodGallery() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await recipientApi.getAvailableListings();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  if (loading) {
     return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading amazing food...</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center animate-fade-in">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          No food items available
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Check back later for new food listings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Available Food Items</h3>
          <p className="text-xs text-muted-foreground">
            {listings.length} active listings available
          </p>
        </div>
        <Link
          href="/recipient/map"
          className="text-xs font-medium text-primary hover:underline"
        >
          View on map
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, index) => {
          return (
            <div
              key={listing.id}
              className="group relative block overflow-hidden rounded-2xl border bg-card shadow-sm transition-smooth hover-lift hover:shadow-lg"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                    Available
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary border border-primary/20">
                    {listing.food_type}
                  </span>
                </div>

                <h4 className="mb-1 text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                  {listing.title}
                </h4>

                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground h-8">
                  {listing.description}
                </p>

                {/* Details */}
                <div className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                    <span className="font-medium">{listing.quantity}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary/70" />
                    <span className="line-clamp-1">
                      {listing.pickup_address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                    <span>
                      Expires: {new Date(listing.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Request Button */}
                <button
                    onClick={async () => {
                        if (confirm(`Request "${listing.title}"?`)) {
                             try {
                                await recipientApi.requestListing(listing.id);
                                window.location.reload(); 
                             } catch(e) {
                                alert("Failed to request listing");
                             }
                        }
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
                >
                  Request Item
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
