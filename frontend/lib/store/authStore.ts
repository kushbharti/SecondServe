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
    full_name?: string;
    email: string;
    phone_number?: string;
    organization_name?: string;
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
          full_name: input.full_name,
          email: input.email,
          phone_number: input.phone_number,
          organization_name: input.organization_name,
          date_joined: new Date().toISOString()
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

