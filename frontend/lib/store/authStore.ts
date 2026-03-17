'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/user';
import { mockUsers } from '@/lib/mock-data/users';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  register: (input: {
    role: UserRole;
    name: string;
    email: string;
    phone: string;
    organizationName?: string;
  }) => void;
  loginWithEmail: (email: string) => void;
  loginAsSample: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      role: null,
      isAuthenticated: false,
      register: input => {
        const user: User = {
          id: `user-${Date.now()}`,
          role: input.role,
          name: input.name,
          email: input.email,
          phone: input.phone,
          organizationName: input.organizationName,
          createdAt: new Date().toISOString()
        };
        set({
          user,
          role: user.role,
          isAuthenticated: true
        });
      },
      loginWithEmail: email => {
        const existing = mockUsers.find(u => u.email === email);
        if (existing) {
          set({
            user: existing,
            role: existing.role,
            isAuthenticated: true
          });
        }
      },
      loginAsSample: role => {
        const sample = mockUsers.find(u => u.role === role) ?? mockUsers[0];
        set({
          user: sample,
          role: sample.role,
          isAuthenticated: true
        });
      },
      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false
        })
    }),
    {
      name: 'frc-auth'
    }
  )
);

