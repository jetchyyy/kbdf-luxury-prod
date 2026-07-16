import { useNavigate } from 'react-router-dom';
import type { Product } from "../types";
import { FadeUp } from "../../../ui/Motion/FadeUp";
import { Heart } from "lucide-react";
import { useFavorites } from '../../favorites/FavoritesContext';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const hasSizes = product.sizes && product.sizes.length > 0;
  const isOutOfStock = 
    product.stock_status === 'out_of_stock' || 
    product.stock_quantity === 0 || 
    (hasSizes && (!product.sizes || product.sizes.every(s => s.quantity <= 0)));

  const favorited = isFavorite(product.id);

  return (
    <FadeUp delay={index * 0.1}>
      <div 
        onClick={() => navigate(`/product/${product.slug}`)}
        className={`group cursor-pointer flex flex-col bg-surface-white h-[420px] relative transition-opacity duration-300 ${isOutOfStock ? 'opacity-65' : ''}`}
      >
        {/* Wishlist Heart */}
        <button 
          className="absolute top-4 right-4 z-10 hover:text-brand-pink transition-colors"
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            toggleFavorite(product);
          }}
        >
          <Heart className={`w-5 h-5 transition-all ${favorited ? 'text-brand-pink fill-brand-pink scale-110' : 'text-typography-primary'}`} strokeWidth={1.5} />
        </button>

        {isOutOfStock && (
          <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold rounded z-10">
            Out of Stock
          </span>
        )}

        {/* Image Area */}
        <div className="w-full flex-1 overflow-hidden bg-transparent flex items-center justify-center bg-brand-navy/5">
          {product.image_urls && product.image_urls[0] ? (
            <img 
              src={product.image_urls[0]} 
              alt={product.title} 
              loading="lazy"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] mix-blend-multiply"
            />
          ) : (
            <span className="text-brand-navy/20 text-xs font-bold uppercase tracking-widest">No Image</span>
          )}
        </div>
        
        {/* Content bottom */}
        <div className="flex flex-col p-5 pt-4">


          {/* Title and Price */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-xs font-semibold text-typography-primary line-clamp-1 flex-1 text-left">
              {product.title}
            </h3>
            <div className="flex flex-col items-end gap-0.5">
              <div className="text-xs font-medium text-typography-primary whitespace-nowrap">
                ₱{product.price.toLocaleString()}
              </div>
              {product.original_price && product.original_price > product.price && (
                <div className="text-[10px] text-typography-muted line-through font-medium whitespace-nowrap">
                  ₱{product.original_price.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Subtitle / Brand */}
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-typography-muted uppercase tracking-[0.2em]">
              {product.brand}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-typography-primary mt-1">
            <span>★</span>
            <span className="underline decoration-1 underline-offset-2">5.0 (35)</span>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
