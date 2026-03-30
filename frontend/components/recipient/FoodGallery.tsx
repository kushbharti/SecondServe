"use client";
import { useEffect, useState } from "react";
import { recipientApi, FoodPost } from "@/lib/recipient";
import {
  Package,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";

function StatusBadge({ status }: { status: FoodPost['status'] }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
    assigned: {
      label: 'Assigned',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    expired: {
      label: 'Expired',
      className: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
    },
  };
  const { label, className } = config[status] ?? config.pending;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${className}`}>
      {label}
    </span>
  );
}

export function FoodGallery() {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await recipientApi.getAvailablePosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch food posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAccept = async (post: FoodPost) => {
    if (!confirm(`Accept "${post.food_name}"? This will mark it as accepted for pickup.`)) return;
    setAcceptingId(post.id);
    try {
      await recipientApi.acceptPost(post.id);
      await fetchPosts();
    } catch {
      alert("Failed to accept this food post. It may have already been accepted.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/50 mb-3" />
        <p className="text-sm animate-pulse">Loading available food…</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          No food items available right now
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Check back later for new food posts from donors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Available Food Posts</h3>
          <p className="text-xs text-muted-foreground">
            {posts.length} active {posts.length === 1 ? 'post' : 'posts'} available
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group relative block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            {/* Food Image */}
            <div className="h-44 w-full bg-muted flex items-center justify-center overflow-hidden border-b relative group/img">
              {post.image ? (
                <img 
                  src={post.image} 
                  alt={post.food_name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/40">No Photo</span>
                </div>
              )}
              {/* Status accent bar (repositioned) */}
              <div className={`absolute top-0 left-0 right-0 h-1 z-10 ${
                post.status === 'pending' ? 'bg-green-400' :
                post.status === 'assigned' ? 'bg-amber-400' :
                post.status === 'completed' ? 'bg-blue-400' : 'bg-red-400'
              }`} />
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Status + food type */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary border border-primary/20">
                  {post.food_type}
                </span>
                <StatusBadge status={post.status} />
              </div>

              <h4 className="mb-1 text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {post.food_name}
              </h4>

              {post.description && (
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground h-8">
                  {post.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                  <span className="font-medium">{post.quantity} servings/items</span>
                </div>
                {post.pickup_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary/70" />
                    <span className="line-clamp-1">{post.pickup_address}</span>
                  </div>
                )}
                {post.expiry_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                    <span>
                      Expires: {new Date(post.expiry_time).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Donor info */}
              {post.donor_name && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  By: <span className="font-medium">{post.donor_name}</span>
                </p>
              )}

              {/* Accept Button — only for pending posts */}
              {post.status === 'pending' && (
                <button
                  onClick={() => handleAccept(post)}
                  disabled={acceptingId === post.id}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptingId === post.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Accepting…
                    </>
                  ) : (
                    <>
                      Accept Food Post
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              {post.status === 'assigned' && (
                <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <CheckCircle className="h-4 w-4" />
                  Assigned — go to My Claims to confirm receipt
                </div>
              )}

              {post.status === 'completed' && (
                <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-4 w-4" />
                  Food Completed ✓
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
