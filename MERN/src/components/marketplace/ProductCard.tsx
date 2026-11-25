import React, { useState } from 'react';
import { Heart, MapPin, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types/marketplace';
import { formatPrice } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelect?: (productId: string) => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, compact = false }) => {
  const { favorites, toggleFavorite, navigate } = useApp();
  const [imgError, setImgError] = useState(false);
  const isSaved = favorites.includes(product.id);

  const handleOpen = () => {
    if (onSelect) {
      onSelect(product.id);
    } else {
      navigate('product-details', { productId: product.id });
    }
  };

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md flex flex-col">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={handleOpen}
          className="w-full h-full block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 cursor-pointer"
          aria-label={`View ${product.title}`}
        >
          {!imgError && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
              <Package className="w-8 h-8 mb-1.5" />
              <span className="text-xs font-medium text-slate-500 line-clamp-1">{product.title}</span>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-label={isSaved ? `Remove ${product.title} from saved items` : `Save ${product.title}`}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
            isSaved
              ? 'bg-white text-rose-600 border-rose-200 shadow-sm'
              : 'bg-white/90 text-slate-600 border-slate-200/80 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      <div className={`flex-1 flex flex-col ${compact ? 'p-3.5' : 'p-4'}`}>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-slate-600">{product.condition}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{product.campusLocation}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          className="text-left focus:outline-none focus-visible:underline cursor-pointer"
        >
          <h3 className="font-display font-semibold text-[15px] text-slate-900 leading-snug line-clamp-2 group-hover:text-teal-800 transition-colors">
            {product.title}
          </h3>
        </button>

        <div className="mt-auto pt-3 flex items-baseline justify-between gap-2">
          <span className="font-mono-tabular text-base font-semibold text-slate-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-slate-500 truncate">{product.sellerName}</span>
        </div>
      </div>
    </article>
  );
};
