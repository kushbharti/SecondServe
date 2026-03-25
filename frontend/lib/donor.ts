import api from './api';

export interface FoodListing {
    id: string;
    title: string;
    description: string;
    food_type: string;
    quantity: string;
    pickup_address: string;
    expiry_date: string;
    status: 'available' | 'assigned' | 'completed' | 'expired';
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
    }
};
