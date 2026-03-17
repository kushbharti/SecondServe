'use client';

import { useMemo, useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin, Package, CheckCircle2, Clock, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FoodHistory() {
  const { listings } = useListings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const allClaims = useMemo(() => {
    if (!user) return [];
    return listings
      .filter(l => l.claimedByRecipientId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [listings, user]);

  const activeClaims = useMemo(() => 
    allClaims.filter(l => ['claimed', 'picked_up'].includes(l.status)),
  [allClaims]);

  const pastClaims = useMemo(() => 
    allClaims.filter(l => ['delivered', 'cancelled', 'expired'].includes(l.status)),
  [allClaims]);

  const displayList = activeTab === 'active' ? activeClaims : pastClaims;

  if (allClaims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/30 p-12 text-center animate-fade-in">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">No food claimed yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          Browse available food listings in your area and claim them to see them here.
        </p>
        <Link
          href="/recipient/browse"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          Browse Food
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/50 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Claims
          {activeClaims.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              {activeClaims.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          History
        </button>
      </div>

      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {displayList.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No {activeTab} claims found.</p>
          </div>
        ) : (
          displayList.map((item, index) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-5 shadow-sm transition-all hover:shadow-md hover:bg-card hover:border-primary/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Image Placeholder or Status Icon */}
                <div className="shrink-0">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl ${
                    item.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                    item.status === 'claimed' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {item.status === 'delivered' ? <CheckCircle2 /> : <Package />}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                      <span className="font-medium text-foreground">{item.quantity}</span> lbs
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                      <span className="font-medium text-foreground">{item.estimatedMeals}</span> meals
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary/70" />
                      <span className="truncate max-w-[200px]">{item.pickupLocation.address}</span>
                    </div>
                  </div>

                  {activeTab === 'active' && (
                    <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
                        <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                           <AlertCircle className="h-3.5 w-3.5" />
                           Awaiting pickup
                        </p>
                       <Link 
                          href={`/recipient/listings/${item.id}`}
                          className="text-xs font-semibold hover:underline flex items-center gap-1"
                       >
                          View Details <ChevronRight className="h-3 w-3" />
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-green-100 text-green-700 ring-green-600/20',
    claimed: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    picked_up: 'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
    delivered: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/10',
    expired: 'bg-gray-100 text-gray-700 ring-gray-600/10',
  };
  
  const label = status.replace('_', ' ');
  const style = styles[status as keyof typeof styles] || styles.expired;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style} capitalize`}>
      {label}
    </span>
  );
}
