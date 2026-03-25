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
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await donorApi.getListings(statusFilter);
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
  }, [user, statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await donorApi.updateStatus(id, newStatus);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
    } catch (error) {
       console.error('Failed to update status:', error);
       alert('Failed to update status');
    }
  };

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

      <div className="flex items-center gap-4 p-4 border rounded-xl bg-card shadow-sm w-full md:w-auto">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 md:flex-none max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">View All Entries</option>
          <option value="available">Pending / Available</option>
          <option value="completed">Completed / Accepted</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="space-y-6">
          <div className="space-y-4">
            {listings.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-xl">No orders or requests found.</div>
            ) : (
                listings.map((req) => (
                <div key={req.id} className="bg-card rounded-xl border p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                            {req.image ? (
                                <img 
                                  src={req.image.startsWith('http') ? req.image : `http://localhost:8000${req.image}`} 
                                  alt={req.title} 
                                  className="h-full w-full object-cover" 
                                />
                            ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                        <h3 className="font-semibold">{req.title}</h3>
                        <p className="text-xs text-muted-foreground">ID: #{req.id}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                            req.status === 'available' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                            req.status === 'expired' ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-green-50 text-green-800 border-green-200'
                        }`}>
                        {req.status === 'completed' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {req.status === 'available' ? 'Pending' :
                         req.status === 'expired' ? 'Expired' :
                         req.status === 'completed' ? 'Completed' : req.status}
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

                    {req.status === 'completed' && req.matched_user_name && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs space-y-1 border">
                            <p className="font-medium text-foreground">Accepted By:</p>
                            <div>{req.matched_user_name}</div>
                            {req.matched_user_phone && <div>📞 {req.matched_user_phone}</div>}
                            {req.matched_user_email && <div className="truncate">✉️ {req.matched_user_email}</div>}
                        </div>
                    )}
                    </div>

                    {req.status === 'available' && (
                        <div className="flex gap-2 pt-4 border-t">
                            <button 
                                onClick={() => handleStatusUpdate(req.id, 'expired')}
                                className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-red-50 text-red-600 border-red-200 transition-colors" 
                                title="Mark as Expired"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
                ))
            )}
          </div>
      </div>
    </div>
  );
}
