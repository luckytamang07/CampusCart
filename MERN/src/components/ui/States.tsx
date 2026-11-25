import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const LoadingState: React.FC<{ count?: number; variant?: 'grid' | 'list' }> = ({
  count = 6,
  variant = 'grid',
}) => {
  if (variant === 'list') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse"
          >
            <div className="w-16 h-16 rounded-lg bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-4/5" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-slate-200 rounded w-16" />
              <div className="h-3 bg-slate-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-14 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="bg-white border border-red-200 rounded-xl px-6 py-12 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
