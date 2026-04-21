"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import type { NearbyDonor } from "@/components/maps/GoogleMapView";
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
} from "lucide-react";
import Link from "next/link";

// ✅ FIX: Use Next.js dynamic instead of lazy
const GoogleMapView = dynamic(() => import("@/components/maps/GoogleMapView"), {
  ssr: false,
});

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lat: number; lng: number }
  | { status: "denied"; message: string };

export default function RecipientMapPage() {
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [donors, setDonors] = useState<NearbyDonor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [donorsError, setDonorsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NearbyDonor | null>(null);

  // ── 1. Get user location (RUN ONLY ONCE) ───────────────────────────────
  const requestLocation = useCallback(() => {
    setLocation({ status: "loading" });

    if (!navigator.geolocation) {
      setLocation({
        status: "denied",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          status: "ready",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Please allow location."
            : "Unable to determine location. Try again.";
        setLocation({ status: "denied", message: msg });
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  // ✅ FIX: run only once
  useEffect(() => {
    requestLocation();
  }, []);

  // ── 2. Fetch donors ────────────────────────────────────────────────────
  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setDonorsLoading(true);
    setDonorsError(null);

    try {
      const res = await api.get(`/donor/nearby/?lat=${lat}&lng=${lng}`);
      setDonors(res.data?.data ?? []);
    } catch (err: any) {
      console.error(err);
      setDonorsError("Failed to load donors");
    } finally {
      setDonorsLoading(false);
    }
  }, []);

  // ✅ FIX: dependency optimized (NO LOOP)
  useEffect(() => {
    if (location.status === "ready") {
      fetchNearby(location.lat, location.lng);
    }
  }, [location.status, location.lat, location.lng]);

  // ── Loading UI ────────────────────────────────────────────────────────
  if (location.status === "idle" || location.status === "loading") {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Detecting your location...</p>
      </div>
    );
  }

  // ── Error UI ──────────────────────────────────────────────────────────
  if (location.status === "denied") {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p>{location.message}</p>
        <button onClick={requestLocation}>Retry</button>
      </div>
    );
  }

  const { lat, lng } = location;

  // ── Main UI ───────────────────────────────────────────────────────────
  return (
    <div className="relative h-[80vh] w-full flex">
      {/* MAP */}
      <div className="flex-1">
        <Suspense fallback={<Loader2 className="animate-spin" />}>
          <GoogleMapView
            receiverLat={lat}
            receiverLng={lng}
            donors={donors}
            onDonorSelect={setSelected}
          />
        </Suspense>
      </div>

      {/* LOADING */}
      {donorsLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded shadow">
          Loading donors...
        </div>
      )}

      {/* ERROR */}
      {donorsError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-red-500">
          {donorsError}
        </div>
      )}

      {/* SIDEBAR */}
      {selected && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-4">
          <button onClick={() => setSelected(null)}>
            <X />
          </button>

          <h2>{selected.food_name}</h2>
          <p>{selected.donor_name}</p>
          <p>{selected.distance_km} km</p>

          <Link href="/recipient/browse">
            View All <ArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
}
