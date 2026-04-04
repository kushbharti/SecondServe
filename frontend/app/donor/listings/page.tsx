'use client';

import { useEffect, useState } from 'react';
import { Search, Package, Loader2, Phone, Mail, Building2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { donorPostsApi, FoodPost, STATUS_LABELS, STATUS_COLORS, PostStatus } from '@/lib/donor';

export default function ManageListingsPage() {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await donorPostsApi.getMyPosts(statusFilter);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredPosts = posts.filter(p =>
    p.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.food_type.toLowerCase().includes(searchQuery.toLowerCase())
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
            Track your food donations and see who has claimed them.
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
            placeholder="Search by food name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary h-[40px] cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-4 gap-3 text-center">
        {(['pending', 'assigned', 'completed', 'expired'] as PostStatus[]).map((s) => {
          const count = posts.filter(p => p.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`rounded-xl border p-3 transition-all text-xs font-semibold ${STATUS_COLORS[s]} ${statusFilter === s ? 'ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
            >
              <div className="text-lg font-bold">{count}</div>
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      {/* Listings Cards */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">No listings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isExpanded = expandedId === post.id;
            const hasAcceptor = (post.status === 'assigned' || post.status === 'completed') && post.accepted_by_name;
            return (
              <div
                key={post.id}
                className="rounded-2xl border bg-card shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Status top stripe */}
                <div className={`h-1 w-full ${
                  post.status === 'pending' ? 'bg-green-400' :
                  post.status === 'assigned' ? 'bg-amber-400' :
                  post.status === 'completed' ? 'bg-blue-400' : 'bg-red-400'
                }`} />

                <div className="p-4 flex items-start gap-4">
                  {/* Food Image / Icon */}
                  <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center shrink-0 border overflow-hidden relative">
                    {post.image ? (
                        <img 
                            src={post.image} 
                            alt={post.food_name} 
                            className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" 
                        />
                    ) : (
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-base">{post.food_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {post.food_type} · {post.quantity} items · 
                          {post.expiry_time && <> Expires {new Date(post.expiry_time).toLocaleDateString()}</>}
                        </p>
                        {post.pickup_address && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{post.pickup_address}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[post.status]}`}>
                          ● {STATUS_LABELS[post.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Acceptor info teaser — click to expand */}
                    {hasAcceptor && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : post.id)}
                        className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors group"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {post.status === 'assigned' ? 'Assigned' : 'Completed'} by {post.accepted_by_name}
                        <span className="text-muted-foreground group-hover:text-blue-600">
                          {isExpanded ? '▲ hide' : '▼ view contact'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded acceptor contact panel */}
                {hasAcceptor && isExpanded && (
                  <div className="border-t bg-blue-50/60 px-6 py-4 space-y-2">
                    <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3">Receiver Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-blue-900">
                        <UserCheck className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="font-medium">{post.accepted_by_name}</span>
                      </div>
                      {post.accepted_by_org && (
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                          <span>{post.accepted_by_org}</span>
                        </div>
                      )}
                      {post.accepted_by_phone && (
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                          <a href={`tel:${post.accepted_by_phone}`} className="hover:underline">{post.accepted_by_phone}</a>
                        </div>
                      )}
                      {post.accepted_by_email && (
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                          <a href={`mailto:${post.accepted_by_email}`} className="hover:underline truncate">{post.accepted_by_email}</a>
                        </div>
                      )}
                      {post.accepted_by_role && (
                        <div className="col-span-full text-xs text-blue-600 font-medium">
                          Role: {post.accepted_by_role.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
