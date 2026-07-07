import { useNavigate } from 'react-router-dom';
import type { Product } from "../types";
import { FadeUp } from "../../../ui/Motion/FadeUp";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <FadeUp delay={index * 0.1}>
      <div 
        onClick={() => navigate(`/product/${product.slug}`)}
        className="group cursor-pointer flex flex-col bg-surface-white h-[400px] relative p-5"
      >


        {/* Wishlist Heart */}
        <button 
          className="absolute top-4 right-4 z-10 text-typography-primary hover:text-brand-pink transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Heart className="w-5 h-5" strokeWidth={1} />
        </button>

        {/* Image Area */}
        <div className="w-full flex-1 flex items-center justify-center mt-6 mb-4 overflow-hidden bg-transparent">
          <img 
            src={product.image_urls[0]} 
            alt={product.title} 
            className="object-contain w-[90%] max-h-full group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] mix-blend-multiply"
          />
        </div>
        
        {/* Content bottom */}
        <div className="mt-auto flex flex-col">


          {/* Title and Price */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-xs font-semibold text-typography-primary line-clamp-1 flex-1 text-left">
              {product.title}
            </h3>
            <div className="text-xs font-medium text-typography-primary whitespace-nowrap">
              ₱{product.price.toLocaleString()}
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
