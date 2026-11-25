import React from 'react';
import {
  Armchair,
  Award,
  Backpack,
  BookOpen,
  FileText,
  Laptop,
  Package,
  Shirt,
} from 'lucide-react';
import { Category, CategorySlug } from '../../types/marketplace';

const CATEGORY_ICONS: Record<CategorySlug, React.ReactNode> = {
  electronics: <Laptop className="w-5 h-5" />,
  books: <BookOpen className="w-5 h-5" />,
  furniture: <Armchair className="w-5 h-5" />,
  clothing: <Shirt className="w-5 h-5" />,
  accessories: <Backpack className="w-5 h-5" />,
  sports: <Award className="w-5 h-5" />,
  notes: <FileText className="w-5 h-5" />,
  other: <Package className="w-5 h-5" />,
};

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  active?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, active = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all duration-150 flex flex-col gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer ${
        active
          ? 'bg-teal-50/70 border-teal-700 text-slate-900'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-sm'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          active ? 'bg-teal-700 text-white' : 'bg-slate-100 text-teal-700'
        }`}
      >
        {CATEGORY_ICONS[category.slug] || <Package className="w-5 h-5" />}
      </div>
      <div>
        <h3 className="font-display font-semibold text-sm text-slate-900">{category.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{category.itemCount} listings</p>
      </div>
    </button>
  );
};
