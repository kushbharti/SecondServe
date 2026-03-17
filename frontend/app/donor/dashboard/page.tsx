'use client';

import { useEffect, useState } from 'react';
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
    totalMeals: 0,
    impact: 0,
    pending: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsData, requestsData] = await Promise.all([
          donorApi.getListings(),
          donorApi.getAvailableRequests(),
        ]);
        setListings(listingsData);
        setAvailableRequests(requestsData.slice(0, 4));

        const activeCount = listingsData.filter((l: FoodListing) => l.status === 'available').length;
        const pendingCount = listingsData.filter((l: FoodListing) => l.status === 'assigned').length;
        setStats({
          active: activeCount,
          totalMeals: listingsData.length * 10,
          impact: listingsData.filter((l: FoodListing) => l.status === 'completed').length * 5,
          pending: pendingCount
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) fetchData();
  }, [user]);

  const handleAcceptRequest = async (id: string) => {
    if (!confirm('Accept this food request and donate?')) return;
    try {
      await donorApi.acceptRequest(id);
      setAvailableRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const statCards = [
    { label: 'Active Listings', value: stats.active.toString(), icon: Package, color: 'text-orange-600', bg: 'bg-orange-100/50' },
    { label: 'Est. Meals Provided', value: stats.totalMeals.toString(), icon: Users, color: 'text-green-600', bg: 'bg-green-100/50' },
    { label: 'Impact Score', value: stats.impact.toString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100/50' },
    { label: 'Pending Pickups', value: stats.pending.toString(), icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100/50' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <div className="text-center py-8 text-muted-foreground text-sm">No listings yet. Create your first one!</div>
            ) : (
              listings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(listing.created_at).toLocaleDateString()} · {listing.quantity}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    listing.status === 'available' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    listing.status === 'assigned' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                    'bg-gray-50 text-gray-700 ring-gray-600/20'
                  }`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
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
              <p className="text-xs text-muted-foreground mt-1">From NGOs, Orphanages & Hospitals</p>
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
                    className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  >
                    Donate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Impact Banner */}
      <div className="rounded-2xl border bg-orange-50/50 p-6 shadow-xs">
        <h3 className="font-semibold text-orange-900 mb-2">Your Impact</h3>
        <p className="text-sm text-orange-800/80 mb-3">
          You've helped provide approximately <strong>{stats.totalMeals} meals</strong> to families in need. Keep donating to reach your monthly goal!
        </p>
        <div className="h-2 w-full bg-orange-200 rounded-full overflow-hidden">
          <div className="h-full w-[75%] bg-orange-500 rounded-full transition-all" />
        </div>
        <p className="text-xs text-orange-700 mt-2 text-right">75% to monthly goal</p>
      </div>
    </div>
  );
}
