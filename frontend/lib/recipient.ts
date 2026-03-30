import api from './api';
import { FoodListing, FoodPost } from './donor';
export type { FoodListing, FoodPost };

export interface FoodRequest {
    id: string;
    receiver: string;
    receiver_name?: string;
    receiver_role?: string;
    receiver_phone?: string;
    receiver_email?: string;
    receiver_org?: string;
    food_post?: string | null;
    food_post_name?: string | null;
    accepted_by?: string | null;
    accepted_by_name?: string | null;
    accepted_by_phone?: string | null;
    accepted_by_email?: string | null;
    food_type_needed?: string;
    quantity_needed: string;
    required_by?: string;
    message?: string;
    status: 'pending' | 'assigned' | 'completed' | 'expired';
    created_at: string;
}

export const recipientApi = {
    // ── Browse & Accept (FoodPost flow) ──────────────────────────────────────

    /** GET all available FoodPosts (public browse page) */
    getAvailablePosts: async (): Promise<FoodPost[]> => {
        const response = await api.get('/donor/posts/');
        return response.data?.data ?? response.data ?? [];
    },

    /** GET a single FoodPost by ID */
    getPostById: async (id: string): Promise<FoodPost> => {
        const response = await api.get(`/donor/posts/${id}/`);
        return response.data?.data ?? response.data;
    },

    /** POST /donor/posts/<id>/accept/ — receiver accepts a food post */
    acceptPost: async (id: string): Promise<FoodPost> => {
        const response = await api.post(`/donor/posts/${id}/accept/`);
        return response.data?.data ?? response.data;
    },

    /** POST /donor/posts/<id>/mark-completed/ — receiver confirms food received */
    markCompleted: async (id: string): Promise<FoodPost> => {
        const response = await api.post(`/donor/posts/${id}/mark-completed/`);
        return response.data?.data ?? response.data;
    },

    /**
     * GET all FoodPosts claimed by this receiver (accepted + received statuses).
     * Backend filters by accepted_by=current_user; no status param = all statuses.
     */
    getMyAcceptedPosts: async (status?: string): Promise<FoodPost[]> => {
        const url = status && status !== 'all'
            ? `/donor/posts/?accepted=true&status=${status}`
            : '/donor/posts/?accepted=true';
        const response = await api.get(url);
        return response.data?.data ?? response.data ?? [];
    },

    // ── Recipient Food Requests (Receiver creates own requests) ──────────────

    getRequests: async (): Promise<FoodRequest[]> => {
        const response = await api.get('/recipient/food-requests/');
        return response.data?.data ?? response.data ?? [];
    },

    createRequest: async (data: Partial<FoodRequest> | FormData): Promise<FoodRequest> => {
        const response = await api.post('/recipient/food-requests/', data);
        return response.data?.data ?? response.data;
    },

    getRequestById: async (id: string): Promise<FoodRequest> => {
        const response = await api.get(`/recipient/food-requests/${id}/`);
        return response.data?.data ?? response.data;
    },

    updateRequest: async (id: string, data: Partial<FoodRequest>): Promise<FoodRequest> => {
        const response = await api.patch(`/recipient/food-requests/${id}/`, data);
        return response.data?.data ?? response.data;
    },

    deleteRequest: async (id: string): Promise<void> => {
        await api.delete(`/recipient/food-requests/${id}/`);
    },

    markRequestCompleted: async (id: string): Promise<FoodRequest> => {
        const response = await api.post(`/recipient/food-requests/${id}/mark-completed/`);
        return response.data?.data ?? response.data;
    },

    // ── Legacy FoodListing-based endpoints (kept for backward compat) ─────────

    getAvailableListings: async () => {
        const response = await api.get('/recipient/available-listings/');
        return response.data?.data ?? response.data;
    },

    acceptDonation: async (id: string) => {
        const response = await api.post(`/recipient/request/${id}/`);
        return response.data?.data ?? response.data;
    },

    getAcceptedDonations: async (status?: string) => {
        const url = status && status !== 'all' ? `/recipient/my-requests/?status=${status}` : '/recipient/my-requests/';
        const response = await api.get(url);
        return response.data?.data ?? response.data;
    },

    cancelDonationAcceptance: async (id: string) => {
        const response = await api.patch(`/recipient/request/${id}/cancel/`);
        return response.data?.data ?? response.data;
    },

    completeDonation: async (id: string) => {
        const response = await api.post(`/recipient/request/${id}/complete/`);
        return response.data?.data ?? response.data;
    },
};

