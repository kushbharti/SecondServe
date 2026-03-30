'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { recipientApi, FoodPost } from '@/lib/recipient';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Calendar, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ExternalLink,
  Store,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { isReceiverRole } from '@/types/user';

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
  
  return `https://source.unsplash.com/800x600/?${term}&sig=${seed}`;
}

export default function FoodItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [listing, setListing] = useState<FoodPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      if (!listingId) return;
      try {
        const data = await recipientApi.getPostById(listingId);
        setListing(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Food item not found or unavailable.');
        } else {
          setError('Failed to load food details.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="text-muted-foreground animate-pulse">Loading details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-3xl border border-dashed bg-card/50 p-12 text-center max-w-md animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Notice</h2>
          <p className="text-sm text-muted-foreground mb-8">
            {error || 'The food listing you are looking for might have been removed or claimed by someone else.'}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isClaimedByMe = listing.accepted_by === user?.id || listing.accepted_by?.includes?.(user?.id as string) || (listing.status === 'assigned' || listing.status === 'completed');
  
  // NOTE: isClaimedByMe logic above covers the accepted_by field or status.
  // Actually, we should check status AND if the accepted_by matches user ID if it's string.
  // Usually if user fetched it in getPostById, they see it only if they accepted it or if it's available.
  const isAvailable = listing.status === 'pending';
  const canClaim = isAvailable && user && isReceiverRole(user.role);

  const handleClaim = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsClaiming(true);
    try {
      await recipientApi.acceptPost(listing.id);
      setListing(prev => prev ? { ...prev, status: 'assigned' } : null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to claim. The post might no longer be available.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Google Maps URL requires address
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(listing.pickup_address || listing.city || '')}`;
  const displayImage = getPlaceholderImage(listing.food_type, listing.id);
  const isExpired = listing.status === 'expired' || (listing.expiry_time && new Date(listing.expiry_time) < new Date());

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
               alt={listing.food_name}
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
                               {listing.food_type.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider shadow-lg border border-white/10 ${
                               ['assigned', 'completed'].includes(listing.status) ? 'bg-amber-500/90 text-white' : 
                               isExpired ? 'bg-red-500/90 text-white' : 'bg-white/10 text-white'
                            }`}>
                               {listing.status === 'pending' && !isExpired ? 'Pending' : 
                                listing.status === 'assigned' ? 'Assigned' : 
                                listing.status === 'completed' ? 'Completed' : 'Expired'}
                            </span>
                         </div>
                         <h1 className="text-4xl md:text-6xl font-bold tracking-tight shadow-sm text-balance">{listing.food_name}</h1>
                         <div className="flex flex-wrap items-center gap-6 text-sm font-medium opacity-90">
                            {listing.city && (
                              <span className="flex items-center gap-2">
                                 <MapPin className="h-5 w-5 text-primary" />
                                 {listing.city}
                              </span>
                            )}
                            {(listing.city && listing.expiry_time) && <span className="hidden md:inline w-1 h-1 rounded-full bg-white/50" />}
                            {listing.expiry_time && (
                              <span className="flex items-center gap-2">
                                 <Clock className="h-5 w-5 text-orange-400" />
                                 Expires {new Date(listing.expiry_time).toLocaleDateString()}
                              </span>
                            )}
                         </div>
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
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { icon: Package, value: listing.quantity, label: 'Items/Servings', color: 'text-blue-600', bg: 'bg-blue-100' },
                    { icon: Calendar, value: listing.expiry_time ? new Date(listing.expiry_time).toLocaleDateString() : 'N/A', label: 'Expiry Date', color: 'text-purple-600', bg: 'bg-purple-100' },
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
                       {listing.description || 'No additional description provided by the donor.'}
                    </p>
                 </div>
              </div>
              
              {/* Pickup Instructions */}
              <div className="bg-card rounded-3xl p-8 border shadow-sm">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Pickup Rules & Info
                 </h3>
                 <div className="flex flex-col md:flex-row gap-6 items-start p-6 bg-muted/30 rounded-2xl border border-dashed">
                    <div className="flex-1 space-y-2">
                          <h4 className="font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded-md inline-block mb-2 text-sm">Important Notes</h4>
                          <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm ml-1">
                             <li>Bring your own bags or containers to transport the food.</li>
                             <li>Contact the donor promptly once you claim the donation to coordinate pickup time.</li> 
                             <li>Confirm receipt via the platform once you collect the food to conclude the cycle.</li>
                             {listing.pickup_address && (
                               <li><strong>Address:</strong> {listing.pickup_address}</li>
                             )}
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
                             <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvailable ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                             <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAvailable ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                          </span>
                          {isAvailable ? 'Pending' : 'Unavailable'}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Donor</p>
                       <span className="font-semibold text-primary flex items-center justify-end gap-1">
                          {listing.donor_name || 'Anonymous User'}
                       </span>
                    </div>
                 </div>
                 
                 {canClaim && !isExpired ? (
                    <button
                       onClick={handleClaim}
                       disabled={isClaiming}
                       className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                       <div className="relative flex items-center gap-2">
                          {isClaiming ? (
                             <>
                               <Loader2 className="h-5 w-5 animate-spin" />
                               Claiming...
                             </>
                          ) : (
                             <>
                                <CheckCircle2 className="h-5 w-5" />
                                Claim Donation
                             </>
                          )}
                       </div>
                    </button>
                 ) : listing.status === 'assigned' || listing.status === 'completed' ? (
                    <div className="w-full py-4 rounded-xl bg-amber-50 text-amber-700 font-bold text-center border-2 border-amber-100 flex items-center justify-center gap-2">
                       <CheckCircle2 className="h-5 w-5" /> Already Claimed
                    </div>
                 ) : (
                    <button disabled className="w-full py-4 rounded-xl bg-muted text-muted-foreground font-bold cursor-not-allowed border-2 border-transparent">
                       {isExpired ? 'Expired' : 'Currently Unavailable'}
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
                                 {listing.pickup_address || listing.city || 'Location unavailable'}
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


