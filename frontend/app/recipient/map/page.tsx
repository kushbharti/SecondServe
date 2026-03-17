'use client';

import { useMemo, useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Navigation, Search, Filter, Package, Clock, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

export default function RecipientMapPage() {
  const { listings } = useListings();
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeListings = useMemo(
    () => listings.filter(l => l.status === 'active' && (
       l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       l.description.toLowerCase().includes(searchQuery.toLowerCase())
    )),
    [listings, searchQuery]
  );

  const selectedListing = useMemo(
      () => activeListings.find(l => l.id === selectedLocation),
      [activeListings, selectedLocation]
  );

  // Mock positions for the demo (randomly distributed around a center)
  // In a real app, these would come from geocoding
  const getPosition = (id: string) => {
     // Deterministic pseudo-random position based on ID string
     const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     const top = 20 + (seed % 60); // 20% to 80%
     const left = 20 + ((seed * 13) % 60); // 20% to 80%
     return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative h-[calc(100vh-4rem-4rem)] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-3xl border shadow-inner">
      {/* Map Background Simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0" 
              style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
          />
          {/* Roads Simulation */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-300 dark:stroke-slate-700" strokeWidth="20" fill="none">
             <path d="M-10,100 Q400,150 600,100 T1200,300" strokeOpacity="0.5"/>
             <path d="M200,-10 L300,800" strokeOpacity="0.5"/>
             <path d="M800,-10 L700,800" strokeOpacity="0.5"/>
          </svg>
      </div>

      {/* Floating Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-20">
         <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
               <Search className="h-4 w-4" />
            </div>
            <input 
               type="text" 
               placeholder="Search food nearby..." 
               className="w-full h-12 rounded-full pl-10 pr-12 bg-white/90 backdrop-blur-md shadow-lg border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute inset-y-0 right-3 flex items-center p-1.5 hover:bg-muted rounded-full transition-colors">
               <Filter className="h-4 w-4 text-muted-foreground" />
            </button>
         </div>
      </div>

      {/* Map Pins */}
      <div className="absolute inset-0 z-10">
         {activeListings.map((listing) => {
            const pos = getPosition(listing.id);
            const isSelected = selectedLocation === listing.id;

            return (
               <button
                  key={listing.id}
                  onClick={() => setSelectedLocation(listing.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-500`}
                  style={{ top: pos.top, left: pos.left }}
               >
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'scale-100 z-10 group-hover:scale-110'}`}>
                     <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white text-primary'}`}>
                        <MapPin className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                     </div>
                     {!isSelected && (
                         <div className="absolute top-full mt-2 px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {listing.title}
                         </div>
                     )}
                     {isSelected && (
                        <div className="absolute -bottom-1 w-2 h-2 bg-primary rotate-45" />
                     )}
                  </div>
               </button>
            );
         })}
      </div>

      {/* Listing Overlay / Sidebar */}
      <div 
         className={`absolute bottom-4 left-4 right-4 md:left-auto md:top-4 md:bottom-4 md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transition-transform duration-500 ease-in-out z-30 flex flex-col ${
            selectedLocation ? 'translate-y-0 md:translate-x-0' : 'translate-y-[110%] md:translate-y-0 md:translate-x-[110%]'
         }`}
      >
         {selectedListing && (
            <div className="flex flex-col h-full relative p-6">
               <button 
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
               >
                  <X className="h-5 w-5 text-muted-foreground" />
               </button>

               <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                   {/* Header */}
                   <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary mb-3">
                         <Package className="h-3.5 w-3.5" />
                         Available Now
                      </div>
                      <h2 className="text-2xl font-bold leading-tight">{selectedListing.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{selectedListing.description}</p>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-muted/50 p-3.5 space-y-1">
                         <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quantity</p>
                         <p className="text-lg font-bold">{selectedListing.quantity} <span className="text-sm font-normal text-muted-foreground">lbs</span></p>
                      </div>
                      <div className="rounded-2xl bg-muted/50 p-3.5 space-y-1">
                         <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Servings</p>
                         <p className="text-lg font-bold">{selectedListing.estimatedMeals} <span className="text-sm font-normal text-muted-foreground">meals</span></p>
                      </div>
                   </div>

                   {/* Location */}
                   <div className="space-y-3">
                      <div className="flex items-start gap-3">
                         <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="font-semibold text-sm">Pickup Location</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{selectedListing.pickupLocation.address}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="font-semibold text-sm">Best Before</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                               {new Date(selectedListing.expiryDate).toLocaleDateString(undefined, {
                                  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                               })}
                            </p>
                         </div>
                      </div>
                   </div>
               </div>

               {/* Action Footer */}
               <div className="mt-auto pt-6 border-t border-border/50">
                  <div className="grid grid-cols-[1fr,auto] gap-3">
                     <Link 
                        href={`/recipient/listings/${selectedListing.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                     >
                        View Details & Claim
                        <ArrowRight className="h-4 w-4" />
                     </Link>
                     <button className="h-12 w-12 rounded-xl border border-input bg-background shadow-sm hover:bg-muted/50 flex items-center justify-center transition-colors" title="Get Directions">
                        <Navigation className="h-5 w-5 text-muted-foreground" />
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Empty State / Prompt */}
      {!selectedLocation && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl animate-bounce-slow">
            Tap a pin to see details
         </div>
      )}
    </div>
  );
}

