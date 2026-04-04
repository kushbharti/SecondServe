'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import api from '@/lib/api';
import type { NearbyDonor } from '@/components/maps/GoogleMapView';
import {
  MapPin,
  Navigation,
  Star,
  AlertCircle,
  Loader2,
  Package,
  ArrowRight,
  X,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// Dynamic import — GoogleMapView must not render server-side
const GoogleMapView = lazy(() => import('@/components/maps/GoogleMapView'));

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; lat: number; lng: number }
  | { status: 'denied'; message: string };

export default function RecipientMapPage() {
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const [donors, setDonors] = useState<NearbyDonor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [donorsError, setDonorsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NearbyDonor | null>(null);

  // ── 1. Request browser location ────────────────────────────────────────
  const requestLocation = useCallback(() => {
    setLocation({ status: 'loading' });
    if (!navigator.geolocation) {
      setLocation({ status: 'denied', message: 'Geolocation is not supported by your browser.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ status: 'ready', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. Please allow location in your browser settings.'
            : 'Unable to determine your location. Please try again.';
        setLocation({ status: 'denied', message: msg });
      },
      { timeout: 10_000, enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // ── 2. Fetch nearby donors once location is known ───────────────────────
  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setDonorsLoading(true);
    setDonorsError(null);
    try {
      const res = await api.get(`/donor/nearby/?lat=${lat}&lng=${lng}`);
      setDonors(res.data?.data ?? []);
    } catch (err: any) {
      console.error('[Map] nearby donors error', err.response?.data ?? err);
      setDonorsError('Could not load nearby donors. Please try again.');
    } finally {
      setDonorsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.status === 'ready') {
      fetchNearby(location.lat, location.lng);
    }
  }, [location, fetchNearby]);

  // ── Loading / error states ─────────────────────────────────────────────
  if (location.status === 'idle' || location.status === 'loading') {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Detecting your location…</p>
      </div>
    );
  }

  if (location.status === 'denied') {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center flex-col gap-4 max-w-sm mx-auto text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Location Unavailable</h2>
        <p className="text-muted-foreground text-sm">{location.message}</p>
        <button
          onClick={requestLocation}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  // ── location.status === 'ready' ────────────────────────────────────────
  const { lat, lng } = location;
  const top3 = donors.filter(d => d.is_top3);

  return (
    <div className="relative h-[calc(100vh-4rem-4rem)] w-full overflow-hidden rounded-3xl border shadow-inner flex">

      {/* ── Map Canvas ────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-muted/30">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <GoogleMapView
            receiverLat={lat}
            receiverLng={lng}
            donors={donors}
            onDonorSelect={setSelected}
          />
        </Suspense>

        {/* Donors loading overlay */}
        {donorsLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-sm font-medium z-20">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Finding nearby donors…
          </div>
        )}

        {/* Donors error */}
        {donorsError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-full shadow text-sm font-medium z-20">
            <AlertCircle className="h-4 w-4" /> {donorsError}
          </div>
        )}

        {/* Top-3 banner */}
        {!donorsLoading && top3.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border px-4 py-3 text-xs z-20 max-w-[220px]">
            <p className="flex items-center gap-1.5 font-bold text-amber-600 mb-2">
              <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
              Nearest 3 Donors
            </p>
            {top3.map(d => (
              <button
                key={d.post_id}
                onClick={() => setSelected(d)}
                className="flex items-center gap-2 w-full text-left py-1 hover:text-primary transition-colors"
              >
                <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="truncate font-medium">{d.food_name}</span>
                <span className="ml-auto text-muted-foreground font-normal shrink-0">{d.distance_km}km</span>
              </button>
            ))}
          </div>
        )}

        {/* No donors empty state */}
        {!donorsLoading && !donorsError && donors.length === 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl">
            No active food donors found nearby
          </div>
        )}
      </div>

      {/* ── Sidebar detail panel ──────────────────────────────────────── */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-full md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-l border-white/20 flex flex-col transition-transform duration-400 ease-in-out z-30 ${
          selected ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selected && (
          <div className="flex flex-col h-full p-6 relative">
            {/* Close */}
            <button
              onClick={() => { setSelected(null); }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Top badge row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {selected.is_top3 && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Star className="h-3 w-3 fill-amber-500 stroke-amber-500" /> Top 3 Nearest
                </span>
              )}
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold capitalize">
                {selected.food_type}
              </span>
              <Package className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>

            <h2 className="text-2xl font-bold leading-tight mb-1">{selected.food_name}</h2>
            <p className="text-sm text-muted-foreground mb-5">by <span className="font-semibold text-foreground">{selected.donor_name}</span></p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl bg-muted/50 p-3.5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quantity</p>
                <p className="text-lg font-bold">{selected.quantity} <span className="text-sm font-normal text-muted-foreground">servings</span></p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3.5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Distance</p>
                <p className="text-lg font-bold">{selected.distance_km} <span className="text-sm font-normal text-muted-foreground">km</span></p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pickup Location</p>
                <p className="text-sm text-muted-foreground mt-0.5">{selected.pickup_address || 'Address not available'}</p>
              </div>
            </div>

            {/* Route hint */}
            <div className="flex items-start gap-3 mb-auto">
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Route</p>
                <p className="text-sm text-muted-foreground mt-0.5">Click the gold marker on the map to draw a route and see ETA.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6 border-t border-border/50">
              <Link
                href={`/recipient/browse`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                View All Available Food <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
