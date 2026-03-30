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
import { donorPostsApi } from '@/lib/donor';
import { FoodRequest } from '@/lib/recipient';
import { useAuthStore } from '@/store/useAuthStore';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'react-hot-toast';

export default function DonorOrdersPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await donorPostsApi.getAvailableFoodRequests(statusFilter);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchRequests();
    }
  }, [user, statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // Legacy placeholder
  };

  const attemptAccept = (id: string) => {
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!selectedRequestId) return;
    setIsAccepting(true);
    try {
      await donorPostsApi.acceptFoodRequest(selectedRequestId);
      await fetchRequests();
      setIsModalOpen(false);
      toast.success('Food request accepted successfully!');
    } catch (e) {
      toast.error('Failed to accept request');
    } finally {
      setIsAccepting(false);
      setSelectedRequestId(null);
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
          <option value="all">View All Entered</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="space-y-6">
          <div className="space-y-4">
            {requests.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-xl">No requests found.</div>
            ) : (
                requests.map((req) => (
                <div key={req.id} className="bg-card rounded-2xl border shadow-xs overflow-hidden transition-all hover:shadow-md">
                    {/* Status top stripe */}
                    <div className={`h-1 w-full ${
                      req.status === 'pending' ? 'bg-green-400' :
                      req.status === 'assigned' ? 'bg-amber-400' :
                      req.status === 'completed' ? 'bg-blue-400' : 'bg-red-400'
                    }`} />
                    
                    <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                        <h3 className="font-semibold">{req.food_type_needed || 'Food Item Needed'}</h3>
                        <p className="text-xs text-muted-foreground">NGO: {req.receiver_name || 'Organization'}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                            req.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                            req.status === 'expired' ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-green-50 text-green-800 border-green-200'
                        }`}>
                        {req.status === 'completed' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {req.status}
                    </span>
                    </div>
                    
                    <div className="grid gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 shrink-0" />
                        <span className="text-foreground font-medium">{req.quantity_needed}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>Required By: {req.required_by ? new Date(req.required_by).toLocaleDateString() : 'No specific date'}</span>
                    </div>

                    {(req.status === 'assigned' || req.status === 'completed') && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs space-y-1 border">
                            <p className="font-medium text-foreground">Requested By:</p>
                            <div>{req.receiver_name}</div>
                            {req.receiver_phone && <div>📞 {req.receiver_phone}</div>}
                            {req.receiver_email && <div className="truncate">✉️ {req.receiver_email}</div>}
                        </div>
                    )}
                    </div>

                    {req.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t">
                            <button 
                                onClick={() => attemptAccept(String(req.id))}
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all flex-1 text-sm" 
                                title="Accept Request"
                            >
                                <CheckCircle className="h-4 w-4" /> Accept Request
                            </button>
                        </div>
                    )}
                    </div>
                </div>
                ))
            )}
          </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAccept}
        title="Accept Food Request"
        description={<p>Are you sure you want to accept this request? You will be responsible for fulfilling this order.</p>}
        confirmLabel="Accept Request"
        variant="primary"
        isLoading={isAccepting}
      />
    </div>
  );
}
