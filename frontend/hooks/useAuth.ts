import { useAuthStore } from '@/store/useAuthStore';

export function useAuth() {
  const auth = useAuthStore();
  return auth;
}

