import { useNavigate } from 'react-router-dom';
import type { Product } from "../types";
import { FadeUp } from "../../../ui/Motion/FadeUp";
import { useCart } from "../../cart/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const hasSizes = product.sizes && product.sizes.length > 0;

  return (
    <FadeUp delay={index * 0.1}>
      <div 
        onClick={() => navigate(`/product/${product.slug}`)}
        className="group cursor-pointer flex flex-col"
      >
        <div className="relative w-full h-[28rem] bg-surface-light overflow-hidden mb-4">
          <img 
            src={product.image_urls[0]} 
            alt={product.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] mix-blend-multiply"
          />
          {product.condition !== 'new' && (
            <div className="absolute top-4 left-4 text-typography-primary px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
              Preloved
            </div>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                if (hasSizes) {
                  navigate(`/product/${product.slug}`);
                } else {
                  addToCart(product);
                }
              }}
              className="w-full bg-brand-navy/95 backdrop-blur-sm text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-pink transition-colors"
            >
              Add to Bag
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <h3 className="text-sm font-sans font-light text-typography-primary mb-1 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-[10px] text-typography-muted font-light mb-2 uppercase tracking-[0.2em]">
            {product.brand}
          </p>
          <p className="text-sm font-sans text-typography-primary">
            PHP {product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </FadeUp>
  );
}
