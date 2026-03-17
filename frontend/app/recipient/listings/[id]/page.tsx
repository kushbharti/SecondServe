'use client';

import { useParams, useRouter } from 'next/navigation';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ExternalLink,
  Share2,
  Heart,
  Store
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

// Calculate estimated value based on meals
function calculatePrice(estimatedMeals: number): number {
  return estimatedMeals * 5;
}

// Helper to get a relevant Unsplash image based on food type
function getPlaceholderImage(foodType: string, id: string) {
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const types: Record<string, string[]> = {
     'cooked_meal': ['meal', 'dinner', 'lunch', 'restaurant+food'],
     'dairy': ['milk', 'cheese', 'yogurt', 'dairy'],
     'produce': ['vegetables', 'fruit', 'farm+produce', 'groceries'],
     'baked_goods': ['bread', 'bakery', 'croissant', 'pastry'],
     'canned_goods': ['canned+food', 'pantry', 'tinned+food'],
  };
  
  const terms = types[foodType] || ['food', 'meal'];
  const term = terms[seed % terms.length];
  
  // Use source.unsplash.com for random reliable images
  // We add a random parameter to ensure different images for different IDs
  return `https://source.unsplash.com/800x600/?${term}&sig=${seed}`;
}

export default function FoodItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { listings, claimListing } = useListings();
  const { user } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);

  // Parse ID correctly from params
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const listing = useMemo(() => {
    return listings.find(l => l.id === listingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, listingId]);

  if (!listing) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-3xl border border-dashed bg-card/50 p-12 text-center max-w-md animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Food item not found</h2>
          <p className="text-sm text-muted-foreground mb-8">
            The food listing you are looking for might have been removed or claimed by someone else.
          </p>
          <Link
            href="/recipient/browse"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Available Food
          </Link>
        </div>
      </div>
    );
  }

  const estimatedValue = calculatePrice(listing.estimatedMeals);
  const isClaimed = listing.claimedByRecipientId === user?.id;
  const canClaim = listing.status === 'active' && user && user.role === 'recipient' && !isClaimed;

  const handleClaim = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsClaiming(true);
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    claimListing(listing.id, user.id);
    setIsClaiming(false);
  };

  // Generate Google Maps URL
  const mapUrl = `https://www.google.com/maps?q=${listing.pickupLocation.latitude},${listing.pickupLocation.longitude}`;

  // Use Unsplash image if no photos provided
  const displayImage = listing.photos && listing.photos.length > 0 
      ? listing.photos[0] 
      : getPlaceholderImage(listing.foodType, listing.id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Hero Section / Navigation */}
      <div className="relative mb-8 group">
         <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 p-2.5 bg-background/60 backdrop-blur-md rounded-full shadow-lg hover:bg-background transition-colors border border-white/20"
         >
            <ArrowLeft className="h-5 w-5" />
         </button>
         
         <div className="relative h-[45vh] md:h-[55vh] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
             <img
               src={displayImage}
               alt={listing.title}
               className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
             />
             
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
             
             <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                <div className="container mx-auto max-w-5xl">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="flex-1 space-y-4">
                         <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-white shadow-lg border border-white/10">
                               {listing.foodType.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider shadow-lg border border-white/10 ${
                               isClaimed ? 'bg-blue-500/90 text-white' : 'bg-white/10 text-white'
                            }`}>
                               {isClaimed ? 'Claimed by you' : listing.status.replace('_', ' ')}
                            </span>
                         </div>
                         <h1 className="text-4xl md:text-6xl font-bold tracking-tight shadow-sm text-balance">{listing.title}</h1>
                         <div className="flex flex-wrap items-center gap-6 text-sm font-medium opacity-90">
                            <span className="flex items-center gap-2">
                               <MapPin className="h-5 w-5 text-primary" />
                               {listing.pickupLocation.address}
                            </span>
                            <span className="hidden md:inline w-1 h-1 rounded-full bg-white/50" />
                            <span className="flex items-center gap-2">
                               <Clock className="h-5 w-5 text-orange-400" />
                               Expires {new Date(listing.expiresAt).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                         <button className="p-3.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/20 active:scale-95">
                            <Share2 className="h-5 w-5" />
                         </button>
                         <button className="p-3.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/20 active:scale-95 text-red-400 hover:text-red-300">
                            <Heart className="h-5 w-5" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
         </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-16 relative z-10">
        <div className="grid gap-8 lg:grid-cols-3">
           
           {/* Left Column: Details */}
           <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { icon: DollarSign, value: `$${estimatedValue}`, label: 'Est. Value', color: 'text-green-600', bg: 'bg-green-100' },
                    { icon: Package, value: listing.quantity, label: 'Pounds (lb)', color: 'text-blue-600', bg: 'bg-blue-100' },
                    { icon: CheckCircle2, value: listing.estimatedMeals, label: 'Meals', color: 'text-orange-600', bg: 'bg-orange-100' },
                    { icon: Calendar, value: Math.ceil((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + ' Days', label: 'Remaining', color: 'text-purple-600', bg: 'bg-purple-100' },
                 ].map((stat, i) => (
                    <div key={i} className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border shadow-sm flex flex-col items-center text-center hover:translate-y-[-2px] transition-transform duration-300">
                       <div className={`p-3 rounded-xl mb-3 ${stat.bg} ${stat.color}`}>
                          <stat.icon className="h-5 w-5" />
                       </div>
                       <span className="text-xl font-bold text-foreground">{stat.value}</span>
                       <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                    </div>
                 ))}
              </div>

              {/* Description Card */}
              <div className="bg-card rounded-3xl p-8 border shadow-sm space-y-6">
                 <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                       <Store className="h-5 w-5 text-primary" />
                       About this listing
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                       {listing.description}
                    </p>
                 </div>
                 
                 <div className="pt-6 border-t">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                       {listing.dietaryTags.map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-muted/50 text-sm font-medium text-foreground border hover:border-primary/50 transition-colors">
                             {tag.replace('_', ' ')}
                          </span>
                       ))}
                       {listing.allergens.map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-red-50 text-sm font-medium text-red-700 border border-red-100 flex items-center gap-1.5">
                             <AlertCircle className="h-3.5 w-3.5" />
                             Contains: {tag.replace('_', ' ')}
                          </span>
                       ))}
                    </div>
                 </div>
              </div>
              
              {/* Pickup Instructions */}
              <div className="bg-card rounded-3xl p-8 border shadow-sm">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Pickup Instructions
                 </h3>
                 <div className="flex flex-col md:flex-row gap-6 items-start p-6 bg-muted/30 rounded-2xl border border-dashed">
                    <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
                       <div className="p-3 bg-background rounded-xl border shadow-sm text-center min-w-[80px]">
                          <span className="block text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Start</span>
                          <span className="block text-lg font-bold mt-1">
                             {new Date(listing.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <div className="p-3 bg-background rounded-xl border shadow-sm text-center min-w-[80px]">
                          <span className="block text-[10px] uppercase text-muted-foreground font-bold tracking-wider">End</span>
                          <span className="block text-lg font-bold mt-1">
                             {new Date(listing.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                    </div>
                    <div className="flex-1 space-y-2">
                          <h4 className="font-semibold">Important Notes</h4>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                             <li>Please arrive strictly within the specified time window.</li>
                             <li>Bring your own bags or containers to transport the food.</li>
                             <li>Contact the donor through the app if you're running late.</li> 
                          </ul>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Right Column: Actions & Map */}
           <div className="space-y-6">
              {/* Main Action Card */}
              <div className="bg-card rounded-3xl p-6 border shadow-lg sticky top-24">
                 <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed">
                    <div>
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                       <p className="font-semibold flex items-center gap-2">
                          <span className={`relative flex h-2.5 w-2.5`}>
                             <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${listing.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                             <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${listing.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                          </span>
                          {listing.status === 'active' ? 'Available' : 'Unavailable'}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Donor</p>
                       <Link href="#" className="font-semibold text-primary hover:underline flex items-center justify-end gap-1">
                          Fresh Bakery <ExternalLink className="h-3 w-3" />
                       </Link>
                    </div>
                 </div>
                 
                 {canClaim ? (
                    <button
                       onClick={handleClaim}
                       disabled={isClaiming}
                       className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                       <div className="relative flex items-center gap-2">
                          {isClaiming ? (
                             <>Claiming...</>
                          ) : (
                             <>
                                <CheckCircle2 className="h-5 w-5" />
                                Claim Donation
                             </>
                          )}
                       </div>
                    </button>
                 ) : isClaimed ? (
                    <div className="w-full py-4 rounded-xl bg-blue-50 text-blue-700 font-bold text-center border-2 border-blue-100 flex items-center justify-center gap-2">
                       <CheckCircle2 className="h-5 w-5" /> Claimed Successfully
                    </div>
                 ) : (
                    <button disabled className="w-full py-4 rounded-xl bg-muted text-muted-foreground font-bold cursor-not-allowed border-2 border-transparent">
                       Currently Unavailable
                    </button>
                 )}
                 
                 {/* Mini Map */}
                 <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                       <p className="text-sm font-semibold">Location</p>
                       <a href={mapUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View on Google Maps</a>
                    </div>
                    
                    <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border shadow-inner group">
                         {/* Map Pattern Overlay */}
                         <div className="absolute inset-0 opacity-40" 
                             style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
                         />
                         
                         {/* Streets Simulation */}
                        <svg className="absolute inset-0 w-full h-full stroke-slate-300" strokeWidth="8" fill="none">
                             <path d="M-10,50 Q100,80 300,50" />
                             <path d="M150,-10 L180,300" />
                        </svg>

                         {/* Pin */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                              <div className="relative">
                                 <div className="h-8 w-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10 relative">
                                    <MapPin className="h-4 w-4 text-white fill-current" />
                                 </div>
                                 <div className="absolute top-7 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 blur-sm rounded-full" />
                              </div>
                              <div className="mt-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md shadow-sm text-[10px] font-bold border opacity-0 group-hover:opacity-100 transition-opacity">
                                 {listing.pickupLocation.address}
                              </div>
                         </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

