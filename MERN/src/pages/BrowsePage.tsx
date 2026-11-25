import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { FilterPanel } from '../components/marketplace/FilterPanel';
import { ProductCard } from '../components/marketplace/ProductCard';
import { SearchBar } from '../components/marketplace/SearchBar';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { useApp } from '../context/AppContext';
import { ProductFilters } from '../types/marketplace';

export const BrowsePage: React.FC = () => {
  const { products, categories, filters, setFilters, resetFilters } = useApp();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const filteredProducts = useMemo(() => {
    const now = Date.now();
    const min = filters.minPrice !== '' ? Number(filters.minPrice) : null;
    const max = filters.maxPrice !== '' ? Number(filters.maxPrice) : null;
    const q = filters.query.trim().toLowerCase();

    const list = products.filter((p) => {
      if (p.status !== 'active') return false;
      if (q) {
        const matchesQuery =
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.campusLocation.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.condition !== 'all' && p.condition !== filters.condition) return false;
      if (filters.campus !== 'all' && p.campusLocation !== filters.campus) return false;
      if (min !== null && !Number.isNaN(min) && p.price < min) return false;
      if (max !== null && !Number.isNaN(max) && p.price > max) return false;

      if (filters.datePosted !== 'all') {
        const ageHours = (now - new Date(p.createdAt).getTime()) / 3600000;
        if (filters.datePosted === '24h' && ageHours > 24) return false;
        if (filters.datePosted === '7d' && ageHours > 24 * 7) return false;
        if (filters.datePosted === '30d' && ageHours > 24 * 30) return false;
      }
      return true;
    });

    if (filters.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, filters]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const triggerSimulatedRefresh = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 320);
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Sort Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Browse Marketplace</h1>
            <p className="text-sm text-slate-600">
              {filteredProducts.length} active campus{' '}
              {filteredProducts.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={filters.query}
              onChange={(q) => setFilters((prev) => ({ ...prev, query: q }))}
              onSubmit={triggerSimulatedRefresh}
              placeholder="Search by item name, course textbook, or campus spot..."
            />
          </div>
          <div className="w-full md:w-52 shrink-0">
            <Select
              aria-label="Sort products"
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sort: e.target.value as ProductFilters['sort'],
                }))
              }
              options={[
                { value: 'newest', label: 'Sort: Newest First' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Desktop Filter Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
          <FilterPanel
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </aside>

        <div className="lg:col-span-9 space-y-6">
          {hasError ? (
            <ErrorState
              message="We could not load campus listings right now. Check your connection and try again."
              onRetry={triggerSimulatedRefresh}
            />
          ) : isLoading ? (
            <LoadingState count={6} />
          ) : visibleProducts.length === 0 ? (
            <EmptyState
              title="No matching products found"
              description="Try widening your price range, clearing your campus filter, or searching with a broader term."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                  >
                    Load More Listings ({filteredProducts.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 flex justify-end"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="w-80 max-w-full bg-slate-50 h-full p-4 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Filter Marketplace
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              categories={categories}
              onChange={setFilters}
              onReset={resetFilters}
            />
            <div className="mt-4">
              <Button fullWidth onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredProducts.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
