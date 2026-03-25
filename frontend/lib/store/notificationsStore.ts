'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types/user';
import { v4 as uuid } from 'uuid';

export type NotificationType =
  | 'listing_claimed'
  | 'listing_expired'
  | 'new_nearby_listing'
  | 'claim_confirmed';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  role: UserRole;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  addNotification: (input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      get unreadCount() {
        return get().items.filter(n => !n.read).length;
      },
      addNotification: input => {
        const now = new Date().toISOString();
        const item: NotificationItem = {
          ...input,
          id: uuid(),
          createdAt: now,
          read: false
        };
        set({ items: [item, ...get().items] });
      },
      markAsRead: id => {
        set({
          items: get().items.map(n =>
            n.id === id
              ? {
                  ...n,
                  read: true
                }
              : n
          )
        });
      },
      markAllAsRead: () => {
        set({
          items: get().items.map(n =>
            n.read
              ? n
              : {
                  ...n,
                  read: true
                }
          )
        });
      }
    }),
    {
      name: 'frc-notifications'
    }
  )
);

