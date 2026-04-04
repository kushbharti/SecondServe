'use client';

import { useEffect, useState } from 'react';
import { recipientApi, FoodPost } from '@/lib/recipient';
import { STATUS_LABELS, STATUS_COLORS, PostStatus } from '@/lib/donor';
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  Loader2,
  ClipboardCheck,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'react-hot-toast';

type FilterTab = 'all' | 'assigned' | 'completed';

const TAB_OPTIONS: { value: FilterTab; label: string }[] = [
  { value: 'all',      label: 'All Claims' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'completed', label: 'Completed' },
];

function StatusBadge({ status }: { status: FoodPost['status'] }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[status as PostStatus] ?? ''}`}>
      ● {STATUS_LABELS[status as PostStatus] ?? status}
    </span>
  );
}

export default function RecipientClaimsPage() {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FoodPost | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipientApi.getMyAcceptedPosts();
      // Only show posts actually claimed by this receiver (assigned or completed)
      const claimed = Array.isArray(data)
        ? data.filter(p => p.status === 'assigned' || p.status === 'completed')
        : [];
      setPosts(claimed);
    } catch (err) {
      console.error('Failed to fetch claimed posts:', err);
      setError('Failed to load your claims. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const attemptConfirm = (post: FoodPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const confirmReceived = async () => {
    if (!selectedPost) return;
    setIsProcessing(true);
    try {
      await recipientApi.markCompleted(selectedPost.id);
      // Optimistic update
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, status: 'completed' as const } : p));
      setIsModalOpen(false);
      toast.success('Receipt confirmed successfully!');
    } catch {
      toast.error('Failed to confirm receipt. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPost(null);
    }
  };

  const filteredPosts = activeTab === 'all'
    ? posts
    : posts.filter(p => p.status === activeTab);

  const counts = {
    all:      posts.length,
    assigned: posts.filter(p => p.status === 'assigned').length,
    completed: posts.filter(p => p.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading your claims…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
        <p className="text-muted-foreground">
          Food posts you have accepted. Click <strong>Confirm Received</strong> once you collect the food.
        </p>
      </div>

      {/* Status Lifecycle Guide */}
      <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-muted/40 border text-xs items-center">
        <span className="font-semibold text-muted-foreground shrink-0">Status Guide:</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 font-medium">● Assigned</span>
        <span className="text-muted-foreground">You accepted but not yet confirmed pickup →</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-medium">● Completed</span>
        <span className="text-muted-foreground">Food collected & confirmed.</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {TAB_OPTIONS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.label}
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {activeTab === 'all' ? 'No claims yet' : `No ${activeTab} claims`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeTab === 'all'
              ? 'Browse available food and accept a post to see it here.'
              : `You have no claims with "${activeTab}" status.`}
          </p>
          {activeTab === 'all' && (
            <Link
              href="/recipient/browse"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Browse Available Food
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Status accent bar */}
              <div className={`h-1.5 w-full ${
                post.status === 'assigned' ? 'bg-amber-400' :
                post.status === 'completed' ? 'bg-blue-400' : 'bg-primary/40'
              }`} />

              {/* Food Image */}
              <div className="h-48 w-full bg-muted flex items-center justify-center overflow-hidden border-b relative group/img">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.food_name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/30 animate-pulse" />
                )}
                {/* Visual overlay for better text contrast/depth */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              </div>

              <div className="flex flex-col flex-1 p-5 gap-4">
                {/* Title + status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base line-clamp-1">{post.food_name}</h3>
                    {post.donor_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Donor: <span className="font-medium">{post.donor_name}</span>
                      </p>
                    )}
                  </div>
                  <StatusBadge status={post.status} />
                </div>

                {/* Food details */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary/60 shrink-0" />
                    <span><span className="font-semibold text-foreground">{post.quantity}</span> servings/items</span>
                  </div>
                  {post.pickup_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{post.pickup_address}</span>
                    </div>
                  )}
                  {post.expiry_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary/60 shrink-0" />
                      <span>Expires: {new Date(post.expiry_time).toLocaleDateString()}</span>
                    </div>
                  )}
                  {post.donor_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary/60 shrink-0" />
                      <a href={`tel:${post.donor_phone}`} className="hover:underline hover:text-foreground">{post.donor_phone}</a>
                    </div>
                  )}
                  {post.donor_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary/60 shrink-0" />
                      <a href={`mailto:${post.donor_email}`} className="hover:underline hover:text-foreground truncate">{post.donor_email}</a>
                    </div>
                  )}
                  {post.description && (
                    <p className="text-xs line-clamp-2 pt-1">{post.description}</p>
                  )}
                </div>

                {/* Action area */}
                <div className="mt-auto">
                  {post.status === 'assigned' && (
                    <button
                      onClick={() => attemptConfirm(post)}
                      className="clay-btn flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold shadow-md transition-all hover:brightness-105 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Received
                    </button>
                  )}

                  {post.status === 'completed' && (
                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Food Received — Thank you! ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmReceived}
        title="Confirm Receipt"
        description={
            <p>
                Are you confirming that you have successfully received <strong>{selectedPost?.food_name}</strong>? 
                This will finalize the claim process and notify the donor.
            </p>
        }
        confirmLabel="Confirm Received"
        variant="success"
        isLoading={isProcessing}
      />
    </div>
  );
}
