'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
}

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch('/api/dashboard/notifications');
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

type ReadPayload =
  | { notificationIds: string[]; all?: never }
  | { notificationIds?: never; all: true };

async function markRead(body: ReadPayload) {
  const res = await fetch('/api/dashboard/notifications/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update notifications');
  return res.json();
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markOne = useMutation({
    mutationFn: (id: string) => markRead({ notificationIds: [id] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => markRead({ all: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-[#d8f3dc]">
        <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <p className="text-[#52796f]">Loading notifications...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load notifications.</p>
      </div>
    );
  }

  const notifications = data;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1a]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[#52796f] mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="flex items-center gap-2 text-sm font-semibold text-[#2d6a4f] hover:underline disabled:opacity-50"
          >
            {markAll.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <Bell className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1a2e1a] mb-2">No notifications yet</h2>
          <p className="text-[#52796f]">Updates about your investments will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => !notification.read && markOne.mutate(notification.id)}
              className={`w-full text-left bg-white rounded-2xl p-5 border transition-colors ${
                notification.read ? 'border-[#d8f3dc] opacity-70' : 'border-[#2d6a4f]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.read ? 'bg-[#f0f7f0] text-[#95d5b2]' : 'bg-[#d8f3dc] text-[#2d6a4f]'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-semibold text-[#1a2e1a] ${notification.read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-[#95d5b2] whitespace-nowrap flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {format(new Date(notification.created_at), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-[#52796f] mt-1 leading-relaxed">{notification.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}