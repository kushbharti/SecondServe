'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Package,
  Users,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Loader2,
  Building2,
  Inbox,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { donorPostsApi, donorApi, FoodPost, STATUS_LABELS, STATUS_COLORS } from '@/lib/donor';
import { FoodRequest } from '@/lib/recipient';
import { useAuthStore } from '@/store/useAuthStore';

function StatusBadge({ status }: { status: FoodPost['status'] }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      ● {STATUS_LABELS[status]}
    </span>
  );
}

export default function DonorDashboardPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [availableRequests, setAvailableRequests] = useState<FoodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    completed: 0,
    expired: 0,
    total: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsData, requestsData] = await Promise.all([
          donorPostsApi.getMyPosts(),
          donorPostsApi.getAvailableFoodRequests('pending'),
        ]);
        const safePosts: FoodPost[] = Array.isArray(postsData) ? postsData : [];
        const safeRequests: FoodRequest[] = Array.isArray(requestsData) ? requestsData : [];

        setPosts(safePosts);
        setAvailableRequests(safeRequests.slice(0, 4));

        setStats({
          pending:   safePosts.filter((p) => p.status === 'pending').length,
          assigned:  safePosts.filter((p) => p.status === 'assigned').length,
          completed: safePosts.filter((p) => p.status === 'completed').length,
          expired:   safePosts.filter((p) => p.status === 'expired').length,
          total:     safePosts.length,
        });
      } catch (error) {
        toast.error('Failed to load dashboard data. Please refresh.');
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) fetchData();
  }, [user]);

  const handleAcceptRequest = async (id: string) => {
    if (!confirm('Accept this food request and donate?')) return;
    const toastId = toast.loading('Processing...');
    try {
      await donorPostsApi.acceptFoodRequest(id);
      setAvailableRequests(prev => prev.filter(r => r.id !== id));
      toast.success('Request accepted! The NGO has been notified.', { id: toastId });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to accept request. Please try again.';
      toast.error(message, { id: toastId });
    }
  };

  const MONTHLY_GOAL = 20;
  const progressPercent = Math.min(Math.round((stats.completed / MONTHLY_GOAL) * 100), 100);

  const statCards = [
    {
      label: 'Pending',
      value: stats.pending.toString(),
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-100/50',
      desc: 'Awaiting a receiver',
    },
    {
      label: 'Assigned',
      value: stats.assigned.toString(),
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-100/50',
      desc: 'Claimed by a receiver',
    },
    {
      label: 'Completed',
      value: stats.completed.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100/50',
      desc: 'Food delivered ✓',
    },
    {
      label: 'Expired',
      value: stats.expired.toString(),
      icon: Clock,
      color: 'text-red-500',
      bg: 'bg-red-100/50',
      desc: 'Passed expiry time',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {(user?.username || user?.full_name)?.split(' ')[0] || 'Donor'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your food donations and real-time impact.
          </p>
        </div>
        <Link
          href="/donor/add-listing"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Listing
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground/70 mt-1">{stat.desc}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Recent Posts — with acceptor info */}
        <div className="rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b p-6">
            <h3 className="font-semibold">My Recent Posts</h3>
            <Link href="/donor/listings" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No posts yet.{' '}
                <Link href="/donor/add-listing" className="text-orange-600 font-medium hover:underline">
                  Create your first one!
                </Link>
              </div>
            ) : (
              posts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-3 rounded-xl border hover:bg-muted/30 transition-colors space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{post.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()} · {post.quantity} items
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>

                  {/* Acceptor details — shown when post is assigned or completed */}
                  {(post.status === 'assigned' || post.status === 'completed') && post.accepted_by_name && (
                    <div className="ml-[52px] p-3 rounded-lg bg-blue-50 border border-blue-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        {post.status === 'assigned' ? 'Assigned to' : 'Completed by'}: {post.accepted_by_name}
                      </div>
                      {post.accepted_by_org && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-700">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          {post.accepted_by_org}
                        </div>
                      )}
                      {post.accepted_by_phone && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-700">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          {post.accepted_by_phone}
                        </div>
                      )}
                      {post.accepted_by_email && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-700">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          {post.accepted_by_email}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incoming Requests from Recipients */}
        <div className="rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary" />
                Incoming Food Requests
              </h3>
              <p className="text-xs text-muted-foreground mt-1">From NGOs, Orphanages &amp; Hospitals</p>
            </div>
            <Link href="/donor/requests" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {availableRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No pending requests at the moment.</div>
            ) : (
              availableRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{req.food_type_needed || 'Food Needed'}</p>
                      <p className="text-xs text-muted-foreground">{req.receiver_name || 'Organization'} · {req.quantity_needed}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                    aria-label={`Donate to ${req.receiver_name || 'organization'}`}
                  >
                    Donate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Impact Banner */}
      <div className="rounded-2xl border bg-orange-50/50 p-6 shadow-xs">
        <h3 className="font-semibold text-orange-900 mb-1">Your Monthly Impact</h3>
        <p className="text-sm text-orange-800/80 mb-3">
          You&apos;ve fulfilled <strong>{stats.completed}</strong> donations this month. Goal: <strong>{MONTHLY_GOAL}</strong>.
        </p>
        <div className="h-2 w-full bg-orange-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-orange-700 mt-2 text-right">{progressPercent}% to monthly goal</p>
      </div>
    </div>
  );
}
