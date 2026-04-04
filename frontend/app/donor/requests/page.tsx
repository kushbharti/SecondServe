'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  CheckCircle,
  Package,
  Loader2,
  Inbox
} from 'lucide-react';
import { donorApi, FoodListing } from '@/lib/donor';
import { useRouter } from 'next/navigation';

export default function AvailableRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await donorApi.getAvailableRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAcceptRequest = async (id: string) => {
    if (!confirm('Are you sure you want to donate food for this request?')) return;
    try {
      await donorApi.acceptRequest(id);
      setRequests(prev => prev.filter(r => String(r.id) !== id));
      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request');
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.food_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Requests</h1>
          <p className="text-muted-foreground">
            Browse food requests from verified recipient organizations and choose to help.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Search requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Request Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length === 0 ? (
                  <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          No available requests at the moment.
                      </td>
                  </tr>
              ) : (
                filteredRequests.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-100/50 flex items-center justify-center shrink-0">
                            <Inbox className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground">Expires: {new Date(item.expiry_date).toLocaleDateString()}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        {item.food_type}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleAcceptRequest(item.id)}
                            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 rounded-lg transition-colors font-semibold shadow-sm"
                        >
                            Donate Food
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
