'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  User, 
  MapPin, 
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { donorApi, FoodListing } from '@/lib/donor';
import { useAuthStore } from '@/store/useAuthStore';

export default function DonorOrdersPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const data = await donorApi.getListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchListings();
    }
  }, [user]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await donorApi.updateStatus(id, newStatus);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
    } catch (error) {
       console.error('Failed to update status:', error);
       alert('Failed to update status');
    }
  };

  const activeRequests = listings.filter(l => l.status === 'assigned');
  const completedOrders = listings.filter(l => l.status === 'completed');

  if (isLoading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Orders & Requests</h1>
        <p className="text-muted-foreground">
          Manage incoming requests and track active deliveries.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Requests Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Active Requests ({activeRequests.length})
          </h2>
          
          <div className="space-y-4">
            {activeRequests.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-xl">No active requests.</div>
            ) : (
                activeRequests.map((req) => (
                <div key={req.id} className="bg-card rounded-xl border p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                        <h3 className="font-semibold">{req.title}</h3>
                        <p className="text-xs text-muted-foreground">ID: #{req.id}</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        Assigned
                    </span>
                    </div>
                    
                    <div className="grid gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 shrink-0" />
                        <span className="text-foreground font-medium">{req.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>Pickup: {new Date(req.expiry_date).toLocaleDateString()}</span>
                    </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                    <button 
                        onClick={() => handleStatusUpdate(req.id, 'completed')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Mark Completed
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate(req.id, 'available')}
                        className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-red-50 text-red-600 border-red-200 transition-colors" 
                        title="Cancel Assignment"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Past Orders Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            Completed Orders ({completedOrders.length})
          </h2>
          
          <div className="space-y-4">
            {completedOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-xl">No completed orders yet.</div>
            ) : (
                completedOrders.map((ord) => (
                <div key={ord.id} className="bg-card/50 rounded-xl border p-4 hover:bg-card transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{ord.title}</h3>
                        <span className="text-xs text-muted-foreground">{new Date(ord.updated_at || ord.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{ord.quantity}</p>
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                        </span>
                        {/* <button className="text-xs text-blue-600 hover:underline">View Details</button> */}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
