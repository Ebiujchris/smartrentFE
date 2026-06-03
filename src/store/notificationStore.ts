import { create } from 'zustand';
import api from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications');
      const notifications = response.data;
      const unreadCount = notifications.filter((n: Notification) => !n.read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark notification as read',
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/notifications/mark-all-read');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark all as read',
      });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.find((n) => n.id === id && !n.read)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete notification',
      });
    }
  },

  // SECURITY: Reset method to clear all data on logout
  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    });
  },
}));
