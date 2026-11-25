import React, { useMemo, useState } from 'react';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { CategoryCard } from '../components/marketplace/CategoryCard';
import { NotificationCard } from '../components/marketplace/NotificationCard';
import { ProductCard } from '../components/marketplace/ProductCard';
import { SearchBar } from '../components/marketplace/SearchBar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    products,
    categories,
    favorites,
    notifications,
    navigate,
    markNotificationRead,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === 'active'),
    [products]
  );

  const recommendedProducts = useMemo(
    () =>
      activeProducts
        .filter((p) => p.sellerId !== currentUser?.id)
        .slice(0, 3),
    [activeProducts, currentUser]
  );

  const recentlyAdded = useMemo(
    () =>
      [...activeProducts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [activeProducts]
  );

  const savedProducts = useMemo(
    () => activeProducts.filter((p) => favorites.includes(p.id)).slice(0, 3),
    [activeProducts, favorites]
  );

  const myListings = useMemo(
    () => products.filter((p) => p.sellerId === currentUser?.id).slice(0, 4),
    [products, currentUser]
  );

  const recentNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);

  const handleSearch = () => {
    navigate('browse', { query: searchQuery });
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Search Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-teal-700">
              {currentUser?.university} · {currentUser?.campusLocation}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Welcome back, {currentUser?.fullName.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Discover new campus listings, manage your items, or message buyers.
            </p>
          </div>
          <Button onClick={() => navigate('sell')}>
            <PlusCircle className="w-4 h-4" />
            Sell a Product
          </Button>
        </div>

        <div className="mt-6 max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search textbooks, electronics, dorm gear..."
          />
        </div>
      </section>

      {/* Categories Strip */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">Categories</h2>
          <button
            type="button"
            onClick={() => navigate('browse', { category: 'all' })}
            className="text-xs font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
          >
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {categories
            .filter((c) => c.active)
            .map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onClick={() => navigate('browse', { category: cat.slug })}
              />
            ))}
        </div>
      </section>

      {/* Recommended Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Recommended on Campus
          </h2>
          <button
            type="button"
            onClick={() => navigate('browse')}
            className="text-xs font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
          >
            See all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recently Added */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">Recently Added</h2>
          <button
            type="button"
            onClick={() => navigate('browse')}
            className="text-xs font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
          >
            Explore latest <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentlyAdded.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Saved Items + My Listings & Notifications split */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900">Saved Products</h2>
            <button
              type="button"
              onClick={() => navigate('saved')}
              className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              View all ({favorites.length})
            </button>
          </div>
          {savedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved products yet"
              description="Tap the heart icon on any campus listing to keep track of items you like."
              actionLabel="Browse Products"
              onAction={() => navigate('browse')}
            />
          )}
        </div>

        <div className="xl:col-span-5 space-y-6">
          {/* My Listings Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-slate-900">My Listings</h2>
              <button
                type="button"
                onClick={() => navigate('my-listings')}
                className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Manage
              </button>
            </div>
            {myListings.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {myListings.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate('product-details', { productId: item.id })}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 px-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {item.status} · {item.views} views
                      </p>
                    </div>
                    <span className="font-mono-tabular text-sm font-semibold text-slate-900 shrink-0">
                      {formatPrice(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You have not posted any listings yet.</p>
            )}
          </div>

          {/* Notifications Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent Notifications
              </h2>
              <button
                type="button"
                onClick={() => navigate('notifications')}
                className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                All notifications
              </button>
            </div>
            <div className="space-y-2.5">
              {recentNotifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.targetView) {
                      navigate(n.targetView, {
                        productId: n.targetView === 'product-details' ? n.targetId : undefined,
                        conversationId: n.targetView === 'messages' ? n.targetId : undefined,
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
