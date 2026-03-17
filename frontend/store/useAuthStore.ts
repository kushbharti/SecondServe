import { create } from 'zustand';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User, DONOR_ROLES, RECEIVER_ROLES } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<{ pending?: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// FIXED: Helper to set cookies with role-aware expiry
// Donors: 7 days, Receivers: 1 day (24h)
function setAuthCookies(access: string, refresh: string, role: string) {
  const isDonor = DONOR_ROLES.includes(role as any);
  const accessExpiry = isDonor ? 7 : 1;   // days
  const refreshExpiry = isDonor ? 30 : 7;  // days

  Cookies.set('accessToken', access, { expires: accessExpiry, sameSite: 'Lax' });
  Cookies.set('refreshToken', refresh, { expires: refreshExpiry, sameSite: 'Lax' });
  Cookies.set('role', role, { expires: accessExpiry, sameSite: 'Lax' });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login/', credentials);

      // FIXED: Unified response format wraps data in response.data.data
      const payload = response.data?.data ?? response.data;
      const { access, refresh, user, role } = payload;

      // FIXED: role-specific cookie expiry
      setAuthCookies(access, refresh, role || user?.role);

      // FIXED: Redirect to correct dashboard based on role
      set({ user, isAuthenticated: true, isLoading: false });

      const userRole = role || user?.role || '';
      if (typeof window !== 'undefined') {
        if (DONOR_ROLES.includes(userRole)) {
          window.location.href = '/donor/dashboard';
        } else if (RECEIVER_ROLES.includes(userRole)) {
          window.location.href = '/recipient/dashboard';
        }
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register/', data);

      // FIXED: unified format
      const payload = response.data?.data ?? response.data;
      const { access, refresh, user } = payload;

      // Receivers get null tokens (pending approval)
      if (access && refresh) {
        setAuthCookies(access, refresh, user?.role);
        set({ user, isAuthenticated: true, isLoading: false });
        return { pending: false };
      } else {
        // Receiver pending — set user in store but NOT authenticated
        set({ user, isAuthenticated: false, isLoading: false });
        return {
          pending: true,
          message: response.data?.message || 'Your account is pending admin approval.',
        };
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('role');
    set({ user: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get('/auth/profile/');
      // FIXED: unified response format
      const user = response.data?.data ?? response.data;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
