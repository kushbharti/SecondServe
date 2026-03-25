'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight,
  Loader2,
  Building2,
  Inbox
} from 'lucide-react';
import Link from 'next/link';
import { donorApi, FoodListing } from '@/lib/donor';
import { useAuthStore } from '@/store/useAuthStore';

export default function DonorDashboardPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [availableRequests, setAvailableRequests] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    totalListings: 0,
    pending: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsData, requestsData] = await Promise.all([
          donorApi.getListings(),
          donorApi.getAvailableRequests(),
        ]);
        const safeListings: FoodListing[] = Array.isArray(listingsData) ? listingsData : [];
        const safeRequests: FoodListing[] = Array.isArray(requestsData) ? requestsData : [];

        setListings(safeListings);
        setAvailableRequests(safeRequests.slice(0, 4));

        const activeCount = safeListings.filter((l) => l.status === 'available').length;
        const pendingCount = safeListings.filter((l) => l.status === 'assigned').length;
        const completedCount = safeListings.filter((l) => l.status === 'completed').length;
        setStats({
          active: activeCount,
          completed: completedCount,
          totalListings: safeListings.length,
          pending: pendingCount,
        });
      } catch (error) {
        toast.error('Failed to load dashboard data. Please refresh.');
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) fetchData();
  }, [user]);

  const handleAcceptRequest = async (id: string) => {
    if (!confirm('Accept this food request and donate?')) return;
    const toastId = toast.loading('Processing...');
    try {
      await donorApi.acceptRequest(id);
      setAvailableRequests(prev => prev.filter(r => r.id !== id));
      toast.success('Request accepted! The NGO has been notified.', { id: toastId });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to accept request. Please try again.';
      toast.error(message, { id: toastId });
    }
  };

  // FIX: Real progress towards a monthly goal of 20 listings
  const MONTHLY_GOAL = 20;
  const progressPercent = Math.min(
    Math.round((stats.completed / MONTHLY_GOAL) * 100),
    100
  );

  const statCards = [
    { 
      label: 'Active Listings', 
      value: stats.active.toString(), 
      icon: Package, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100/50',
      desc: 'Currently available'
    },
    { 
      label: 'Est. Meals Provided', 
      // Estimate: each completed listing serves ~10 people
      value: (stats.completed * 10).toLocaleString(), 
      icon: Users, 
      color: 'text-green-600', 
      bg: 'bg-green-100/50',
      desc: 'From completed donations'
    },
    { 
      label: 'Completed', 
      value: stats.completed.toString(), 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100/50',
      desc: 'Total fulfilled donations'
    },
    { 
      label: 'Pending Pickups', 
      value: stats.pending.toString(), 
      icon: Clock, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100/50',
      desc: 'Awaiting receiver pickup'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Skeleton header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-muted animate-pulse rounded-xl" />
            <div className="h-4 w-72 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded-xl" />
        </div>
        {/* Skeleton stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 shadow-xs">
              <div className="h-4 w-24 bg-muted animate-pulse rounded mb-3" />
              <div className="h-7 w-12 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {(user?.username || user?.full_name)?.split(' ')[0] || 'Donor'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your donations and real-time impact.
          </p>
        </div>
        <Link 
          href="/donor/add-listing" 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Listing
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground/70 mt-1">{stat.desc}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Listings + Incoming Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent My Listings */}
        <div className="rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b p-6">
            <h3 className="font-semibold">My Recent Listings</h3>
            <Link href="/donor/listings" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {listings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No listings yet.{' '}
                <Link href="/donor/add-listing" className="text-orange-600 font-medium hover:underline">
                  Create your first one!
                </Link>
              </div>
            ) : (
              listings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(listing.created_at).toLocaleDateString()} · {listing.quantity}
                      </p>
                      {listing.status === 'assigned' && listing.matched_user_name && (
                        <div className="mt-2 text-xs text-blue-800 bg-blue-50 p-2 rounded-md border border-blue-100">
                           <p className="font-semibold mb-0.5">Pickup by {listing.matched_user_name}</p>
                           {listing.matched_user_phone && <p>📞 {listing.matched_user_phone}</p>}
                           {listing.matched_user_email && <p>✉️ {listing.matched_user_email}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    listing.status === 'available' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                    listing.status === 'assigned' ? 'bg-green-50 text-green-800 ring-green-600/20' :
                    listing.status === 'expired' ? 'bg-red-50 text-red-800 ring-red-600/20' :
                    'bg-blue-50 text-blue-800 ring-blue-600/20'
                  }`}>
                    {listing.status === 'available' ? 'Pending' :
                     listing.status === 'assigned' ? 'Accepted' :
                     listing.status === 'expired' ? 'Expired' :
                     'Completed'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incoming Requests from Recipients */}
        <div className="rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary" />
                Incoming Food Requests
              </h3>
              <p className="text-xs text-muted-foreground mt-1">From NGOs, Orphanages &amp; Hospitals</p>
            </div>
            <Link href="/donor/requests" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {availableRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No pending requests at the moment.</div>
            ) : (
              availableRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.author_name || 'Organization'} · {req.quantity}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    aria-label={`Donate to ${req.author_name || 'organization'}`}
                  >
                    Donate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Impact Banner — FIX: Real data-driven progress bar */}
      <div className="rounded-2xl border bg-orange-50/50 p-6 shadow-xs">
        <h3 className="font-semibold text-orange-900 mb-1">Your Monthly Impact</h3>
        <p className="text-sm text-orange-800/80 mb-3">
          You&apos;ve completed <strong>{stats.completed}</strong> donations this month.
          Goal: <strong>{MONTHLY_GOAL}</strong> donations.
        </p>
        <div className="h-2 w-full bg-orange-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div 
            className="h-full bg-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-orange-700 mt-2 text-right">{progressPercent}% to monthly goal</p>
      </div>
    </div>
  );
}
