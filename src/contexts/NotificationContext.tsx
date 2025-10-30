/**
 * Notification Context
 * Provides real-time notification updates across the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, type Notification } from '@/services/notificationService';
import { productUpdatesService } from '@/services/productUpdatesService';

interface NotificationContextValue {
  unreadCount: number;
  unseenUpdatesCount: number;
  totalCount: number;
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  refreshCounts: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenUpdatesCount, setUnseenUpdatesCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshCounts = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setUnseenUpdatesCount(0);
      return;
    }

    try {
      const [notifCount, updatesCount] = await Promise.all([
        notificationService.getUnreadCount(),
        productUpdatesService.getUnseenUpdatesCount(),
      ]);
      setUnreadCount(notifCount);
      setUnseenUpdatesCount(updatesCount);
    } catch (error) {
      console.error('Error refreshing notification counts:', error);
    }
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const data = await notificationService.getUnreadNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [user]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await notificationService.markAsRead(notificationId);
      await refreshNotifications();
      await refreshCounts();
    },
    [refreshNotifications, refreshCounts]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    await refreshNotifications();
    await refreshCounts();
  }, [refreshNotifications, refreshCounts]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      await notificationService.deleteNotification(notificationId);
      await refreshNotifications();
      await refreshCounts();
    },
    [refreshNotifications, refreshCounts]
  );

  // Initial load
  useEffect(() => {
    if (user) {
      refreshNotifications();
      refreshCounts();
    }
  }, [user, refreshNotifications, refreshCounts]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = notificationService.subscribeToNotifications(user.id, () => {
      refreshNotifications();
      refreshCounts();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, refreshNotifications, refreshCounts]);

  const totalCount = unreadCount + unseenUpdatesCount;

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        unseenUpdatesCount,
        totalCount,
        notifications,
        refreshNotifications,
        refreshCounts,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
