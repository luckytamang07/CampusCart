import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { Message } from '../../types/marketplace';
import { formatShortTime, getInitials } from '../../utils/formatters';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'bg-teal-700 text-white rounded-br-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
        }`}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Chat attachment"
            referrerPolicy="no-referrer"
            className="rounded-lg mb-2 max-h-52 w-auto object-cover border border-black/10"
          />
        )}
        {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
      </div>
      <span className="text-[11px] text-slate-400 mt-1 px-1 tabular-nums">
        {formatShortTime(message.createdAt)}
      </span>
    </div>
  );
};

interface ProfileCardProps {
  name: string;
  university: string;
  rating: number;
  verified?: boolean;
  avatarUrl?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  university,
  rating,
  verified = false,
  avatarUrl,
  subtitle,
  action,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal-700 text-white font-display font-semibold text-sm flex items-center justify-center shrink-0">
            {getInitials(name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-display font-semibold text-sm text-slate-900 truncate">{name}</h4>
            {verified && (
              <ShieldCheck
                className="w-4 h-4 text-teal-700 shrink-0"
                aria-label="University account"
              />
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">{university}</p>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
            <span className="inline-flex items-center gap-1 font-medium tabular-nums">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {rating.toFixed(1)}
            </span>
            {subtitle && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{subtitle}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
