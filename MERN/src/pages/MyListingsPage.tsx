import React, { useMemo, useState } from 'react';
import { CheckCircle, Edit3, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/States';
import { useApp } from '../context/AppContext';
import { ListingStatus } from '../types/marketplace';
import { formatPrice, formatRelativeDate } from '../utils/formatters';

export const MyListingsPage: React.FC = () => {
  const {
    products,
    currentUser,
    navigate,
    deleteListing,
    changeListingStatus,
  } = useApp();
  const [activeTab, setActiveTab] = useState<ListingStatus>('active');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const myProducts = useMemo(
    () => products.filter((p) => p.sellerId === currentUser?.id),
    [products, currentUser]
  );

  const counts = useMemo(
    () => ({
      active: myProducts.filter((p) => p.status === 'active').length,
      sold: myProducts.filter((p) => p.status === 'sold').length,
      draft: myProducts.filter((p) => p.status === 'draft').length,
    }),
    [myProducts]
  );

  const displayed = useMemo(
    () => myProducts.filter((p) => p.status === activeTab),
    [myProducts, activeTab]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage your active campus items, drafts, and completed sales.
          </p>
        </div>
        <Button onClick={() => navigate('sell')}>
          <PlusCircle className="w-4 h-4" />
          New Listing
        </Button>
      </div>

      {/* Segmented Status Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
        {(['active', 'sold', 'draft'] as ListingStatus[]).map((tab) => {
          const isCurrent = activeTab === tab;
          const label = tab === 'active' ? 'Active' : tab === 'sold' ? 'Sold' : 'Draft';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isCurrent
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label} <span className="ml-1 text-xs tabular-nums text-slate-500">({counts[tab]})</span>
            </button>
          );
        })}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} listings`}
          description={
            activeTab === 'active'
              ? 'Post an item to start connecting with student buyers on your campus.'
              : activeTab === 'sold'
              ? 'Items you mark as sold will appear here for your sales history.'
              : 'Saved listing drafts will appear here until you are ready to publish.'
          }
          actionLabel="Sell a Product"
          onAction={() => navigate('sell')}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-16 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="capitalize font-medium text-teal-700">{item.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.condition}</span>
                    <span aria-hidden="true">·</span>
                    <span>Posted {formatRelativeDate(item.createdAt)}</span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900 truncate">
                    {item.title}
                  </h3>
                  <p className="font-mono-tabular text-sm font-semibold text-slate-900 mt-0.5">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('product-details', { productId: item.id })}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('sell', { editProductId: item.id })}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                {item.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeListingStatus(item.id, 'sold')}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Mark as Sold
                  </Button>
                )}
                {item.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => changeListingStatus(item.id, 'active')}
                  >
                    Publish
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-red-600 hover:!bg-red-50"
                  onClick={() => setDeleteTargetId(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteListing(deleteTargetId);
        }}
        title="Delete listing?"
        description="This action permanently removes the listing from CampusCart. Students will no longer be able to view it."
        confirmLabel="Delete Listing"
        danger
      />
    </div>
  );
};
