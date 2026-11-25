import React from 'react';
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../types/marketplace';
import { formatRelativeDate } from '../../utils/formatters';

const TYPE_STYLES: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
  new_message: {
    icon: <MessageSquare className="w-4 h-4 text-teal-700" />,
    bg: 'bg-teal-50',
  },
  product_interest: {
    icon: <Heart className="w-4 h-4 text-rose-600" />,
    bg: 'bg-rose-50',
  },
  listing_approved: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    bg: 'bg-emerald-50',
  },
  product_sold: {
    icon: <ShoppingBag className="w-4 h-4 text-amber-700" />,
    bg: 'bg-amber-50',
  },
  listing_update: {
    icon: <RefreshCw className="w-4 h-4 text-slate-700" />,
    bg: 'bg-slate-100',
  },
  system: {
    icon: <Bell className="w-4 h-4 text-indigo-600" />,
    bg: 'bg-indigo-50',
  },
};

interface NotificationCardProps {
  notification: NotificationItem;
  onClick: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClick }) => {
  const style = TYPE_STYLES[notification.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
        notification.read
          ? 'bg-white border-slate-200 hover:bg-slate-50'
          : 'bg-teal-50/40 border-teal-200 hover:bg-teal-50/70'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-sm font-semibold text-slate-900 leading-snug">
            {notification.title}
          </h4>
          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
            {formatRelativeDate(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notification.description}</p>
        {!notification.read && (
          <p className="text-xs font-medium text-teal-700 mt-1.5">Unread</p>
        )}
      </div>
    </button>
  );
};
