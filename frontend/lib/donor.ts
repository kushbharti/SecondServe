import api from './api';

// ─── Legacy FoodListing (used by old /donor/listings/ endpoint) ─────────────
export interface FoodListing {
    id: string;
    title: string;
    description: string;
    food_type: string;
    quantity: string;
    pickup_address: string;
    expiry_date: string;
    status: 'available' | 'assigned' | 'accepted' | 'received' | 'completed' | 'expired';
    listing_type: 'donation' | 'request';
    created_at: string;
    updated_at?: string;
    author: string;
    author_name?: string;
    author_role?: string;
    author_phone?: string;
    author_email?: string;
    matched_user?: string | null;
    matched_user_name?: string | null;
    matched_user_phone?: string | null;
    matched_user_email?: string | null;
    image?: string | null;
}

// ─── New FoodPost (primary status lifecycle model) ───────────────────────────
export interface FoodPost {
    id: string;
    donor: string;
    donor_name?: string;
    donor_role?: string;
    donor_phone?: string;
    donor_email?: string;
    food_name: string;
    quantity: number;
    food_type: string;
    servings?: number;
    expiry_time?: string;
    pickup_address?: string;
    city?: string;
    status: 'pending' | 'assigned' | 'completed' | 'expired';
    // Who accepted this post (populated after receiver accepts)
    accepted_by?: string | null;
    accepted_by_name?: string | null;
    accepted_by_org?: string | null;
    accepted_by_phone?: string | null;
    accepted_by_email?: string | null;
    accepted_by_role?: string | null;
    image?: string | null;
    description?: string;
    created_at: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────
export type PostStatus = FoodPost['status'];

export const STATUS_LABELS: Record<PostStatus, string> = {
    pending: 'Pending',
    assigned:  'Assigned',
    completed:  'Completed',
    expired:   'Expired',
};

export const STATUS_COLORS: Record<PostStatus, string> = {
    pending: 'bg-green-50 text-green-700 border-green-200',
    assigned:  'bg-amber-50 text-amber-700 border-amber-200',
    completed:  'bg-blue-50 text-blue-700 border-blue-200',
    expired:   'bg-red-50 text-red-700 border-red-200',
};

// ─── Donor API (FoodPost — primary) ──────────────────────────────────────────
export const donorPostsApi = {
    /** GET donor's own FoodPosts (all statuses unless filtered) */
    getMyPosts: async (status?: string): Promise<FoodPost[]> => {
        const url = status && status !== 'all'
            ? `/donor/posts/?status=${status}`
            : '/donor/posts/';
        const response = await api.get(url);
        return response.data?.data ?? response.data ?? [];
    },

    /** POST /donor/posts/ — create a new food post */
    createPost: async (data: FormData | Record<string, unknown>): Promise<FoodPost> => {
        const response = await api.post('/donor/posts/', data);
        return response.data?.data ?? response.data;
    },

    /** GET /donor/posts/<id>/ */
    getPostById: async (id: string): Promise<FoodPost> => {
        const response = await api.get(`/donor/posts/${id}/`);
        return response.data?.data ?? response.data;
    },

    // ── Donor API for FoodRequests ───────────────────────────────────────────
    
    getAvailableFoodRequests: async (status?: string): Promise<any[]> => {
        const url = status && status !== 'all' 
            ? `/recipient/food-requests/?status=${status}` 
            : `/recipient/food-requests/`;
        const response = await api.get(url);
        return response.data?.data ?? response.data ?? [];
    },

    acceptFoodRequest: async (id: string): Promise<any> => {
        const response = await api.post(`/recipient/food-requests/${id}/accept/`);
        return response.data?.data ?? response.data;
    },
};

// ─── Legacy Donor API (FoodListing — kept for backward compat) ───────────────
export const donorApi = {
    getListings: async (status?: string) => {
        const url = status && status !== 'all' ? `/donor/listings/?status=${status}` : '/donor/listings/';
        const response = await api.get(url);
        return response.data?.data ?? response.data;
    },

    createListing: async (data: Partial<FoodListing> | FormData) => {
        const response = await api.post('/donor/listings/', data);
        return response.data?.data ?? response.data;
    },

    getListingById: async (id: string) => {
        const response = await api.get(`/donor/listings/${id}/`);
        return response.data?.data ?? response.data;
    },

    updateListing: async (id: string, data: Partial<FoodListing>) => {
        const response = await api.put(`/donor/listings/${id}/`, data);
        return response.data?.data ?? response.data;
    },

    deleteListing: async (id: string) => {
        await api.delete(`/donor/listings/${id}/`);
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/donor/listings/${id}/status/`, { status });
        return response.data?.data ?? response.data;
    },

    getAvailableRequests: async () => {
        const response = await api.get('/donor/available-requests/');
        return response.data?.data ?? response.data;
    },

    acceptRequest: async (id: string) => {
        const response = await api.post(`/donor/accept-request/${id}/`);
        return response.data?.data ?? response.data;
    },
};
