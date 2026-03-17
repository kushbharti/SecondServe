'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Trash2, 
  CheckCircle,
  Loader2,
  List
} from 'lucide-react';
import { recipientApi } from '@/lib/recipient';
import type { FoodListing } from '@/lib/recipient';
import { useRouter } from 'next/navigation';

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await recipientApi.getRequests();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await recipientApi.deleteRequest(id);
      setRequests(prev => prev.filter(l => String(l.id) !== id));
    } catch (error) {
      console.error('Failed to delete request:', error);
      alert('Failed to delete request');
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'completed' : 'available';
    try {
      await recipientApi.updateRequest(id, { status: newStatus as any });
      setRequests(prev => prev.map(l => String(l.id) === id ? { ...l, status: newStatus as any } : l));
    } catch (error) {
       console.error('Failed to update status:', error);
    }
  };

  const filteredRequests = requests.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.food_type.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground">
            Manage your food requests and track their status.
          </p>
        </div>
        <button 
          onClick={() => router.push("/recipient/add-request")}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
        >
           Create New Request
        </button>
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
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length === 0 ? (
                  <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          No requests found. Create your first request!
                      </td>
                  </tr>
              ) : (
                filteredRequests.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100/50 flex items-center justify-center shrink-0">
                            <List className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground">Needed by: {new Date(item.expiry_date).toLocaleDateString()}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        {item.food_type}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === 'available' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        item.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        {item.status === 'available' ? 'Pending' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleStatusUpdate(String(item.id), item.status)}
                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" 
                            title={item.status === 'available' ? "Mark as Fulfilled" : "Mark as Pending"}
                        >
                            <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(String(item.id))}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" 
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
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
