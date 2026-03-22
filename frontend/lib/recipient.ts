import api from './api';
import { FoodListing } from './donor';
export type { FoodListing };

export const recipientApi = {
    getAvailableListings: async () => {
        const response = await api.get('/recipient/available-listings/');
        return response.data?.data ?? response.data;
    },

    acceptDonation: async (id: string) => {
        const response = await api.post(`/recipient/request/${id}/`);
        return response.data?.data ?? response.data;
    },

    getAcceptedDonations: async () => {
        const response = await api.get('/recipient/my-requests/');
        return response.data?.data ?? response.data;
    },

    cancelDonationAcceptance: async (id: string) => {
        const response = await api.patch(`/recipient/request/${id}/cancel/`);
        return response.data?.data ?? response.data;
    },

    // FIX: Added missing completeDonation — calls the CompleteListingView endpoint
    // that exists on the backend but was never wired up in the frontend
    completeDonation: async (id: string) => {
        const response = await api.post(`/recipient/request/${id}/complete/`);
        return response.data?.data ?? response.data;
    },

    // Recipient creating and managing their own food requests
    getRequests: async () => {
        const response = await api.get('/recipient/requests/');
        return response.data?.data ?? response.data;
    },

    createRequest: async (data: Partial<FoodListing> | FormData) => {
        const response = await api.post('/recipient/requests/', data);
        return response.data?.data ?? response.data;
    },

    getRequestById: async (id: string) => {
        const response = await api.get(`/recipient/requests/${id}/`);
        return response.data?.data ?? response.data;
    },

    updateRequest: async (id: string, data: Partial<FoodListing>) => {
        const response = await api.put(`/recipient/requests/${id}/`, data);
        return response.data?.data ?? response.data;
    },

    deleteRequest: async (id: string) => {
        await api.delete(`/recipient/requests/${id}/`);
    }
};
