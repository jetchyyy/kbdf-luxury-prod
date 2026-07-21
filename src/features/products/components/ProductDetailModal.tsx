import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../../cart/CartContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const { addToCart, items } = useCart();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const matchedSizeObj = hasSizes ? product.sizes?.find(s => s.size === selectedSize) : null;
  const allSizesOutOfStock = hasSizes && product.sizes?.every(s => s.quantity <= 0);
  const isOutOfStock = hasSizes 
    ? (selectedSize ? (matchedSizeObj?.quantity ?? 0) <= 0 : allSizesOutOfStock)
    : product.stock_status === 'out_of_stock' || (product.stock_quantity ?? 0) <= 0;

  const maxAvailable = allSizesOutOfStock
    ? 0
    : hasSizes
    ? (matchedSizeObj ? matchedSizeObj.quantity : 1)
    : (product.stock_status === 'out_of_stock' ? 0 : (product.stock_quantity ?? 99));

  const cartItem = items?.find(item => item.id === product.id && item.selectedSize === (selectedSize || null));
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isCartLimitReached = maxAvailable > 0 && cartQuantity >= maxAvailable;

  const handleAddToBag = () => {
    setErrorMsg('');
    if (hasSizes && !selectedSize) {
      setErrorMsg('Please select a size before adding to your bag.');
      return;
    }

    if (isOutOfStock || (matchedSizeObj && matchedSizeObj.quantity <= 0)) {
      setErrorMsg('This item is out of stock.');
      return;
    }

    if (isCartLimitReached) {
      setErrorMsg('You already have all available stock of this item in your bag.');
      return;
    }

    // Call addToCart with product and custom selected size
    addToCart({
      ...product,
      selectedSize: selectedSize || null
    } as any);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80] overflow-y-auto">
      <div className="bg-surface-white border border-surface-light rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8 max-h-[90vh]">
        
        {/* Left Column: Image Carousel */}
        <div className="w-full md:w-[50%] bg-surface-offWhite flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-surface-light">
          {/* Main Display Image */}
          <div className="relative aspect-[3/4] w-full bg-surface-white rounded-xl overflow-hidden border border-surface-light mb-4">
            <img
              src={product.image_urls[selectedImageIdx] || '/placeholder.png'}
              alt={product.title}
              className="w-full h-full object-cover mix-blend-multiply"
            />
            {product.condition !== 'new' && (
              <span className="absolute top-4 left-4 bg-brand-navy/90 text-white px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold rounded">
                Preloved
              </span>
            )}
          </div>

          {/* Thumbnail Carousel */}
          {product.image_urls.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full">
              {product.image_urls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                    selectedImageIdx === idx ? 'border-brand-pink scale-105' : 'border-surface-light opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="w-full md:w-[50%] p-8 flex flex-col justify-between relative bg-white">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-typography-muted hover:text-brand-pink transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="space-y-6">
            {/* Brand and category */}
            <div>
              <p className="text-xs text-brand-peach font-bold uppercase tracking-widest mb-1">
                {product.brand}
              </p>
              <h2 className="text-xl font-bold text-typography-primary leading-tight font-sans">
                {product.title}
              </h2>
              <p className="text-lg font-bold text-typography-primary mt-2">
                PHP {product.price.toLocaleString()}
              </p>
            </div>

            {/* Condition Info */}
            <div className="bg-surface-offWhite border border-surface-light rounded-xl p-3.5 flex items-center justify-between text-xs">
              <span className="text-typography-muted">Product Condition:</span>
              <span className="font-bold text-typography-primary uppercase tracking-wider">
                {product.condition.replace('_', ' ')}
              </span>
            </div>

             {/* Size Selector */}
            {hasSizes && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-typography-primary">Select Size</span>
                  {selectedSize && (() => {
                    const matched = product.sizes?.find(s => s.size === selectedSize);
                    return matched ? (
                      <span className="text-brand-pink font-bold">
                        Selected: {selectedSize} ({matched.quantity} left)
                      </span>
                    ) : null;
                  })()}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((sizeObj) => {
                    const isOutOfStock = sizeObj.quantity <= 0;
                    const isSelected = selectedSize === sizeObj.size;
                    return (
                      <button
                        key={sizeObj.size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(sizeObj.size);
                          setErrorMsg('');
                        }}
                        className={`px-4 py-2 border rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          isOutOfStock
                            ? 'bg-surface-offWhite border-surface-light text-typography-muted cursor-not-allowed opacity-40 line-through'
                            : isSelected
                            ? 'bg-brand-navy border-brand-navy text-white shadow-md'
                            : 'bg-white border-surface-light text-typography-primary hover:border-typography-primary hover:bg-surface-offWhite'
                        }`}
                      >
                        {sizeObj.size} {isOutOfStock ? '(Out of stock)' : `(${sizeObj.quantity} left)`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-typography-muted tracking-wider block">Description</span>
              <p className="text-xs text-typography-muted leading-relaxed whitespace-pre-line bg-surface-offWhite/30 border border-surface-light/40 p-4 rounded-xl max-h-40 overflow-y-auto">
                {product.description || 'No additional description provided.'}
              </p>
            </div>
          </div>

          {/* Add to bag action */}
          <div className="pt-6 border-t border-surface-light mt-6 space-y-2">
            {errorMsg && (
              <p className="text-red-500 text-xs font-medium animate-pulse">{errorMsg}</p>
            )}
            <button
              onClick={handleAddToBag}
              disabled={isOutOfStock || isCartLimitReached}
              className="w-full flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-pink text-white py-4 text-xs uppercase tracking-widest font-bold transition-colors rounded-xl shadow-lg disabled:bg-surface-light disabled:text-typography-muted disabled:cursor-not-allowed disabled:shadow-none"
            >
              <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Out of Stock' : isCartLimitReached ? 'All Stock in Bag' : 'Add to Bag'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
export default ProductDetailModal;
