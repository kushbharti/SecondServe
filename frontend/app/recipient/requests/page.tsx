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
import type { FoodRequest } from '@/lib/recipient';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'react-hot-toast';

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDeleteAttempt = (id: string) => {
    setSelectedRequestId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRequestId) return;
    setIsProcessing(true);
    try {
      await recipientApi.deleteRequest(selectedRequestId);
      setRequests(prev => prev.filter(l => String(l.id) !== selectedRequestId));
      setIsDeleteModalOpen(false);
      toast.success('Food request deleted.');
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error('Failed to delete request');
    } finally {
      setIsProcessing(false);
      setSelectedRequestId(null);
    }
  };

  const handleCompleteAttempt = (id: string, currentStatus: string) => {
    if (currentStatus !== 'assigned') {
        toast.error('You can only complete a request once a donor has accepted it.');
        return;
    }
    setSelectedRequestId(id);
    setIsFulfillModalOpen(true);
  };

  const confirmComplete = async () => {
    if (!selectedRequestId) return;
    setIsProcessing(true);
    try {
      await recipientApi.markRequestCompleted(selectedRequestId);
      setRequests(prev => prev.map(l => String(l.id) === selectedRequestId ? { ...l, status: 'completed' as const } : l));
      setIsFulfillModalOpen(false);
      toast.success('Request marked as completed!');
    } catch (error) {
       console.error('Failed to update status:', error);
       toast.error('Failed to mark as fulfilled.');
    } finally {
      setIsProcessing(false);
      setSelectedRequestId(null);
    }
  };

  const filteredRequests = requests.filter(l => 
    (l.food_type_needed || '').toLowerCase().includes(searchQuery.toLowerCase())
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
                <th className="px-6 py-4 font-medium">Quantity Needed</th>
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
                            <div className="font-medium text-foreground">{item.food_type_needed || 'Food Item Needed'}</div>
                            <div className="text-xs text-muted-foreground">Needed by: {item.required_by ? new Date(item.required_by).toLocaleDateString() : 'No specific date'}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        {item.quantity_needed}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        item.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        {(item.status === 'assigned' || item.status === 'completed') && item.accepted_by_name && (
                            <div className="mt-2 text-xs text-blue-800">
                                <div>Donor: <strong>{item.accepted_by_name}</strong></div>
                                {item.accepted_by_phone && <div>📞 {item.accepted_by_phone}</div>}
                                {item.accepted_by_email && <div>✉️ <a href={`mailto:${item.accepted_by_email}`} className="hover:underline">{item.accepted_by_email}</a></div>}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === 'assigned' && (
                          <button 
                              onClick={() => handleCompleteAttempt(String(item.id), item.status)}
                              className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" 
                              title="Mark as Fulfilled"
                          >
                              <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                            onClick={() => handleDeleteAttempt(String(item.id))}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Request"
        description="Are you sure you want to delete this food request? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isProcessing}
      />

      <ConfirmModal
        isOpen={isFulfillModalOpen}
        onClose={() => setIsFulfillModalOpen(false)}
        onConfirm={confirmComplete}
        title="Confirm Fulfillment"
        description={<p>Are you sure you want to mark this request as completed? Make sure you have received the food item securely.</p>}
        confirmLabel="Mark as Completed"
        variant="success"
        isLoading={isProcessing}
      />
    </div>
  );
}
