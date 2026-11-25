import React, { useMemo } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { useApp } from '../context/AppContext';

export const SavedItemsPage: React.FC = () => {
  const { products, favorites, toggleFavorite, navigate } = useApp();

  const savedProducts = useMemo(
    () => products.filter((p) => favorites.includes(p.id)),
    [products, favorites]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Saved Items</h1>
          <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
            {savedProducts.length} saved {savedProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('browse')}>
          Browse More Products
        </Button>
      </div>

      {savedProducts.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-6 h-6 text-slate-400" />}
          title="You haven't saved any products yet."
          description="Save textbooks, electronics, or dorm furniture while browsing to easily compare them later."
          actionLabel="Browse Campus Marketplace"
          onAction={() => navigate('browse')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((product) => (
            <div key={product.id} className="space-y-2">
              <ProductCard product={product} />
              <div className="flex items-center justify-between gap-2 px-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate('product-details', { productId: product.id })}
                >
                  View Product
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-slate-600 hover:!text-red-600"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
