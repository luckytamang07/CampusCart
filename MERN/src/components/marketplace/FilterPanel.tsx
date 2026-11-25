import React from 'react';
import { RotateCcw } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../../data/seedData';
import { Category, CategorySlug, ProductCondition, ProductFilters } from '../../types/marketplace';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

interface FilterPanelProps {
  filters: ProductFilters;
  categories: Category[];
  onChange: (updater: (prev: ProductFilters) => ProductFilters) => void;
  onReset: () => void;
}

const CONDITIONS: Array<ProductCondition | 'all'> = ['all', 'New', 'Like New', 'Good', 'Fair'];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  categories,
  onChange,
  onReset,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="font-display text-sm font-semibold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <Select
        label="Category"
        value={filters.category}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, category: e.target.value as CategorySlug | 'all' }))
        }
        options={[
          { value: 'all', label: 'All Categories' },
          ...categories.filter((c) => c.active).map((c) => ({ value: c.slug, label: c.name })),
        ]}
      />

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">Condition</span>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((cond) => {
            const active = filters.condition === cond;
            return (
              <button
                key={cond}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, condition: cond }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cond === 'all' ? 'Any' : cond}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-1.5">Price Range (₹)</span>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            aria-label="Minimum price"
            value={filters.minPrice}
            onChange={(e) => onChange((prev) => ({ ...prev, minPrice: e.target.value }))}
          />
          <Input
            type="number"
            min="0"
            placeholder="Max"
            aria-label="Maximum price"
            value={filters.maxPrice}
            onChange={(e) => onChange((prev) => ({ ...prev, maxPrice: e.target.value }))}
          />
        </div>
      </div>

      <Select
        label="Campus Meetup Spot"
        value={filters.campus}
        onChange={(e) => onChange((prev) => ({ ...prev, campus: e.target.value }))}
        options={[
          { value: 'all', label: 'All Campus Locations' },
          ...CAMPUS_LOCATIONS.map((loc) => ({ value: loc, label: loc })),
        ]}
      />

      <Select
        label="Date Posted"
        value={filters.datePosted}
        onChange={(e) =>
          onChange((prev) => ({
            ...prev,
            datePosted: e.target.value as ProductFilters['datePosted'],
          }))
        }
        options={[
          { value: 'all', label: 'Any time' },
          { value: '24h', label: 'Last 24 hours' },
          { value: '7d', label: 'Last 7 days' },
          { value: '30d', label: 'Last 30 days' },
        ]}
      />

      <div className="pt-1 lg:hidden">
        <Button variant="outline" fullWidth onClick={onReset}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};
