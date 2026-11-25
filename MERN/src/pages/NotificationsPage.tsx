import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { NotificationCard } from '../components/marketplace/NotificationCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { useApp } from '../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, navigate } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = useMemo(
    () => (filter === 'unread' ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filter]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6 text-slate-400" />}
          title={filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}
          description="Updates about messages, buyer interest, and listing approvals will appear here."
          actionLabel={filter === 'unread' ? 'View All Notifications' : 'Browse Marketplace'}
          onAction={() => (filter === 'unread' ? setFilter('all') : navigate('browse'))}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.targetView) {
                  navigate(item.targetView, {
                    productId: item.targetView === 'product-details' ? item.targetId : undefined,
                    conversationId: item.targetView === 'messages' ? item.targetId : undefined,
                  });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
