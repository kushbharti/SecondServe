'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar, MapPin, Package, CheckCircle2, Clock, ChevronRight, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { recipientApi } from '@/lib/recipient';
import type { FoodListing } from '@/lib/donor';

export function FoodHistory() {
  const [claims, setClaims] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchClaims() {
      setIsLoading(true);
      try {
        const data = await recipientApi.getAcceptedDonations(statusFilter);
        setClaims(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load food claims:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      fetchClaims();
    }
  }, [user, statusFilter]);

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (claims.length === 0 && statusFilter === 'all') {
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
      {/* Heading and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Claims History</h2>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-card px-4 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary h-[38px] cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="available">Pending</option>
          <option value="assigned">Accepted</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {claims.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No claims found matching this status.</p>
          </div>
        ) : (
          claims.map((item, index) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-5 shadow-sm transition-all hover:shadow-md hover:bg-card hover:border-primary/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Image Placeholder or Status Icon */}
                <div className="shrink-0">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl overflow-hidden border ${
                    item.status === 'completed' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                    item.status === 'assigned' ? 'bg-green-100 text-green-600 border-green-200' :
                    item.status === 'expired' ? 'bg-red-100 text-red-600 border-red-200' :
                    'bg-yellow-100 text-yellow-600 border-yellow-200'
                  }`}>
                    {item.image ? (
                        <img 
                          src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${item.image}`} 
                          alt={item.title} 
                          className="h-full w-full object-cover" 
                        />
                    ) : item.status === 'completed' ? (
                        <CheckCircle2 />
                    ) : (
                        <Package />
                    )}
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
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                       <Package className="h-4 w-4 text-primary/70" />
                      <span className="font-medium text-foreground">{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary/70" />
                      <span className="truncate max-w-[200px]">{item.pickup_address || 'Address provided upon acceptance'}</span>
                    </div>
                  </div>

                  {item.status === 'assigned' && (
                    <div className="mt-4 pt-4 border-t border-dashed flex items-baseline justify-between">
                        <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                           <AlertCircle className="h-3.5 w-3.5" />
                           Awaiting pickup
                        </p>
                    </div>
                  )}

                  {/* Show Donor Contact Info when active */}
                  {item.status === 'assigned' && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-100 flex flex-col gap-1.5 animate-in fade-in duration-300">
                      <p className="text-xs font-semibold text-orange-900 mb-1">Pickup contact:</p>
                      {item.author_name && (
                        <p className="text-xs text-orange-800 flex items-center gap-2">
                           <span className="font-medium text-orange-900 w-12">Name:</span> {item.author_name}
                        </p>
                      )}
                      {item.author_phone && (
                        <p className="text-xs text-orange-800 flex items-center gap-2">
                           <span className="font-medium text-orange-900 w-12">Phone:</span> 
                           <a href={`tel:${item.author_phone}`} className="hover:underline">{item.author_phone}</a>
                        </p>
                      )}
                      {item.author_email && (
                        <p className="text-xs text-orange-800 flex items-center gap-2">
                           <span className="font-medium text-orange-900 w-12">Email:</span> 
                           <a href={`mailto:${item.author_email}`} className="hover:underline">{item.author_email}</a>
                        </p>
                      )}
                      {(!item.author_phone && !item.author_email) && (
                        <p className="text-xs text-orange-800/70 italic">Details will be shared directly by donor.</p>
                      )}
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
    available: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    assigned: 'bg-green-100 text-green-800 ring-green-600/20',
    completed: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    expired: 'bg-red-100 text-red-800 ring-red-600/20',
  };
  
  const labels: Record<string, string> = {
    available: 'Pending',
    assigned: 'Accepted',
    completed: 'Completed',
    expired: 'Expired'
  };
  
  const label = labels[status] || status.replace('_', ' ');
  const style = styles[status as keyof typeof styles] || styles.expired;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style} capitalize`}>
      {label}
    </span>
  );
}
