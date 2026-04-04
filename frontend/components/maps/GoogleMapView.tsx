'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface NearbyDonor {
  post_id: string;
  donor_id: string;
  donor_name: string;
  latitude: number;
  longitude: number;
  food_name: string;
  food_type: string;
  quantity: number;
  pickup_address: string;
  distance_km: number;
  is_top3: boolean;
}

interface GoogleMapViewProps {
  receiverLat: number;
  receiverLng: number;
  donors: NearbyDonor[];
  onDonorSelect?: (donor: NearbyDonor | null) => void;
}

// ── Load the Maps JS API script once ──────────────────────────────────────
let scriptLoaded = false;
let loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    if ((window as any).google?.maps) { resolve(); return; }
    if (scriptLoaded) { loadCallbacks.push(resolve); return; }
    scriptLoaded = true;
    loadCallbacks.push(resolve);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => { loadCallbacks.forEach(cb => cb()); loadCallbacks = []; };
    document.head.appendChild(script);
  });
}

// ── SVG data URIs for custom markers ──────────────────────────────────────
const RECEIVER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 28 18 28S36 30 36 18C36 8.06 27.94 0 18 0z" fill="#2563eb"/><circle cx="18" cy="18" r="8" fill="white"/></svg>`;
const DONOR_ICON_SVG     = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26S32 27 32 16C32 7.16 24.84 0 16 0z" fill="#6b7280"/><circle cx="16" cy="16" r="7" fill="white"/></svg>`;
const TOP3_ICON_SVG      = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 28 18 28S36 30 36 18C36 8.06 27.94 0 18 0z" fill="#d97706"/><circle cx="18" cy="18" r="8" fill="white"/><text x="18" y="23" text-anchor="middle" font-size="12" font-weight="bold" fill="#d97706">★</text></svg>`;

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function GoogleMapView({
  receiverLat,
  receiverLng,
  donors,
  onDonorSelect,
}: GoogleMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // ── Initialise map once ────────────────────────────────────────────────
  const initMap = useCallback(async () => {
    if (!containerRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.warn('GoogleMapView: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.');
    }
    await loadGoogleMapsScript(apiKey);

    const g = (window as any).google;
    if (!g?.maps) return;

    const center = { lat: receiverLat, lng: receiverLng };

    const map = new g.maps.Map(containerRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
      ],
    });
    mapRef.current = map;

    // Directions renderer
    const renderer = new g.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#2563eb', strokeWeight: 4, strokeOpacity: 0.75 },
    });
    renderer.setMap(map);
    directionsRendererRef.current = renderer;

    infoWindowRef.current = new g.maps.InfoWindow();

    // Receiver marker
    new g.maps.Marker({
      position: center,
      map,
      title: 'You are here',
      icon: { url: svgToDataUri(RECEIVER_ICON_SVG), scaledSize: new g.maps.Size(36, 46) },
      zIndex: 100,
    });

    placedonorMarkers(map, g);
  }, [receiverLat, receiverLng]); // eslint-disable-line

  // ── Place / refresh donor markers whenever donors list changes ─────────
  const placedonorMarkers = useCallback(
    (map: google.maps.Map, g: any) => {
      // Clear old markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      const infoWindow = infoWindowRef.current!;
      const renderer = directionsRendererRef.current!;
      const directionsService = new g.maps.DirectionsService();

      donors.forEach((donor) => {
        const iconSvg = donor.is_top3 ? TOP3_ICON_SVG : DONOR_ICON_SVG;
        const iconSize = donor.is_top3 ? new g.maps.Size(36, 46) : new g.maps.Size(32, 42);

        const marker = new g.maps.Marker({
          position: { lat: donor.latitude, lng: donor.longitude },
          map,
          title: donor.donor_name,
          icon: { url: svgToDataUri(iconSvg), scaledSize: iconSize },
          zIndex: donor.is_top3 ? 50 : 10,
        });

        marker.addListener('click', () => {
          onDonorSelect?.(donor);

          // InfoWindow content
          const badge = donor.is_top3
            ? `<span style="background:#d97706;color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">★ Top 3</span>`
            : '';
          const foodTypeBadge = `<span style="background:#f3f4f6;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;text-transform:capitalize;">${donor.food_type}</span>`;
          const content = `
            <div style="font-family:sans-serif;max-width:220px;padding:4px 2px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                ${badge}${foodTypeBadge}
              </div>
              <div style="font-size:15px;font-weight:700;margin-bottom:2px;">${donor.food_name}</div>
              <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">by ${donor.donor_name}</div>
              <div style="font-size:13px;color:#374151;">Qty: <strong>${donor.quantity}</strong> &nbsp;·&nbsp; ${donor.distance_km} km away</div>
              <div style="font-size:11px;color:#9ca3af;margin-top:4px;">${donor.pickup_address}</div>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);

          // Draw route
          directionsService.route(
            {
              origin: { lat: receiverLat, lng: receiverLng },
              destination: { lat: donor.latitude, lng: donor.longitude },
              travelMode: g.maps.TravelMode.DRIVING,
            },
            (result: any, status: string) => {
              if (status === 'OK') {
                renderer.setDirections(result);
                const leg = result.routes[0]?.legs[0];
                if (leg) {
                  // Append distance + duration to the InfoWindow
                  const extra = `
                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;display:flex;gap:12px;">
                      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:600;">Distance</div>
                        <div style="font-size:13px;font-weight:700;">${leg.distance?.text}</div></div>
                      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:600;">ETA</div>
                        <div style="font-size:13px;font-weight:700;">${leg.duration?.text}</div></div>
                    </div>
                  `;
                  infoWindow.setContent(content + extra);
                }
              } else {
                console.warn('Directions failed:', status);
              }
            },
          );
        });

        markersRef.current.push(marker);
      });
    },
    [donors, receiverLat, receiverLng, onDonorSelect],
  );

  // ── Init map on mount ──────────────────────────────────────────────────
  useEffect(() => {
    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-place markers when donors list updates (after map is ready) ─────
  useEffect(() => {
    if (!mapRef.current) return;
    const g = (window as any).google;
    if (!g?.maps) return;
    placedonorMarkers(mapRef.current, g);
  }, [donors, placedonorMarkers]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-3xl overflow-hidden"
      style={{ minHeight: 400 }}
      aria-label="Nearby donors map"
    />
  );
}
