import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  // Let axios set Content-Type automatically (multipart for FormData, json for objects)
});

// Request interceptor — attach Bearer token from cookie
api.interceptors.request.use(
  (config) => {
    // SSR safety: Cookies only available in browser
    if (typeof window !== 'undefined') {
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — silent token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window === 'undefined') throw new Error('SSR — cannot refresh');

        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Only DONOR role gets 7-day expiry; receivers get 1 day
        const role = Cookies.get('role') || '';
        const DONOR_ROLES = ['DONOR'];
        const accessExpiry = DONOR_ROLES.includes(role) ? 7 : 1;
        Cookies.set('accessToken', access, { expires: accessExpiry, sameSite: 'Lax' });

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear auth and redirect to login
        if (typeof window !== 'undefined') {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('role');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
