'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle,
  Package,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { donorApi, FoodListing } from '@/lib/donor';
import { useRouter } from 'next/navigation';

export default function ManageListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await donorApi.deleteListing(id);
      setListings(prev => prev.filter(l => String(l.id) !== id));
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert('Failed to delete listing');
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'completed' : 'available';
    try {
      await donorApi.updateStatus(id, newStatus);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
    } catch (error) {
       console.error('Failed to update status:', error);
    }
  };

  const filteredListings = listings.filter(l => 
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
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your active food donations and track their status.
          </p>
        </div>
        <Link 
          href="/donor/add-listing" 
          className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 active:scale-95"
        >
           Create New Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Search listings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        {/* <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filter
        </button> */}
      </div>

      {/* Listings Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Listing Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredListings.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No listings found.
                      </td>
                  </tr>
              ) : (
                filteredListings.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-100/50 flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-orange-600" />
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
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/donor/listings/${item.id}`} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit">
                            <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                            onClick={() => handleStatusUpdate(item.id, item.status)}
                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" 
                            title={item.status === 'available' ? "Mark as Completed" : "Mark as Available"}
                        >
                            <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
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
