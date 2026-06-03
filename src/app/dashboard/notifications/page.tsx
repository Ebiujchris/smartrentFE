'use client';

import { useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      default: return 'ℹ️';
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-1">Stay updated with important alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No notifications
            </h2>
            <p className="text-slate-600">
              You&apos;re all caught up! Notifications will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border p-4 transition-colors ${
                !notification.read ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-xl mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
