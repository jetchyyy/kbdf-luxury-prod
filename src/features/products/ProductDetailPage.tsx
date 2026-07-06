import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { fetchProductBySlug } from './api';
import type { Product } from './types';
import { useCart } from '../cart/CartContext';
import { useNotification } from '../../core/context/NotificationContext';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      fetchProductBySlug(slug)
        .then(data => {
          setProduct(data);
          // Set default selected size if it's "One Size" preset or similar
          if (data?.sizes && data.sizes.length === 1) {
            setSelectedSize(data.sizes[0].size);
          }
        })
        .catch(err => {
          console.error(err);
          showError('Failed to load product details.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [slug]);

  // Adjust quantity limit when selected size changes
  useEffect(() => {
    setQuantity(1);
    setErrorMsg('');
  }, [selectedSize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-surface-white">
        <div className="w-8 h-8 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 bg-surface-white">
        <h2 className="text-xl font-bold text-typography-primary">Product Not Found</h2>
        <Link to="/shop" className="text-brand-pink inline-flex items-center gap-1.5 hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const hasSizes = product.sizes && product.sizes.length > 0;
  const matchedSizeObj = product.sizes?.find(s => s.size === selectedSize);
  const maxAvailable = matchedSizeObj ? matchedSizeObj.quantity : product.sizes?.[0] ? 0 : 99; // Fallback stock limit

  const handleAddToBag = () => {
    setErrorMsg('');
    if (hasSizes && !selectedSize) {
      setErrorMsg('Please select a size before adding to your bag.');
      return;
    }

    if (maxAvailable <= 0) {
      setErrorMsg('Selected size is out of stock.');
      return;
    }

    // Add to cart with specific quantity and selected size
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        selectedSize: selectedSize || null
      } as any);
    }

    showSuccess(`${product.title} (${selectedSize || 'Standard'}) added to Bag!`);
  };

  return (
    <div className="bg-surface-white min-h-screen py-10 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-typography-muted hover:text-brand-navy transition-all font-semibold tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop Listing
        </Link>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-12 mt-4">
          
          {/* Left Column: Images Carousel */}
          <div className="w-full lg:w-[55%] space-y-4">
            <div className="relative aspect-[3/4] w-full bg-surface-offWhite rounded-2xl overflow-hidden border border-surface-light">
              <img
                src={product.image_urls[selectedImageIdx] || '/placeholder.png'}
                alt={product.title}
                className="w-full h-full object-cover mix-blend-multiply"
              />
              {product.condition !== 'new' && (
                <span className="absolute top-4 left-4 bg-brand-navy text-white px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-semibold rounded shadow-sm">
                  Preloved
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.image_urls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 max-w-full">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
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
          <div className="w-full lg:w-[45%] flex flex-col justify-between py-2">
            <div className="space-y-6">
              {/* Brand and titles */}
              <div>
                <p className="text-xs text-brand-peach font-bold uppercase tracking-widest mb-1.5">
                  {product.brand}
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-typography-primary leading-tight font-sans">
                  {product.title}
                </h1>
                <p className="text-xl font-bold text-typography-primary mt-3">
                  PHP {product.price.toLocaleString()}
                </p>
              </div>

              {/* Condition Badge */}
              <div className="bg-surface-offWhite border border-surface-light rounded-2xl p-4 flex items-center justify-between text-xs">
                <span className="text-typography-muted">Product Condition</span>
                <span className="font-bold text-typography-primary uppercase tracking-wider bg-white px-3 py-1 rounded-xl border border-surface-light">
                  {product.condition.replace('_', ' ')}
                </span>
              </div>

              {/* Sizes Selection */}
              {hasSizes && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-typography-primary">Select Size Option</span>
                    {selectedSize && matchedSizeObj && (
                      <span className="text-brand-pink font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> {selectedSize} ({matchedSizeObj.quantity} left)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes?.map((sizeObj) => {
                      const isOutOfStock = sizeObj.quantity <= 0;
                      const isSelected = selectedSize === sizeObj.size;
                      return (
                        <button
                          key={sizeObj.size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(sizeObj.size)}
                          className={`px-4 py-2.5 border rounded-xl text-xs font-semibold tracking-wide transition-all ${
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

                  {errorMsg && (
                    <p className="text-red-500 text-xs font-medium animate-pulse">{errorMsg}</p>
                  )}
                </div>
              )}

              {/* Quantity Picker */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-typography-muted tracking-wider block">Quantity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-surface-light rounded-xl overflow-hidden bg-surface-offWhite h-11">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || maxAvailable <= 0}
                      className="px-3.5 text-typography-muted hover:text-brand-navy disabled:opacity-30 transition-all h-full"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-typography-primary min-w-[32px] text-center">
                      {maxAvailable <= 0 ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(maxAvailable, q + 1))}
                      disabled={quantity >= maxAvailable || maxAvailable <= 0}
                      className="px-3.5 text-typography-muted hover:text-brand-navy disabled:opacity-30 transition-all h-full"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {selectedSize && maxAvailable > 0 && (
                    <span className="text-xs text-typography-muted">
                      Max available: {maxAvailable}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase font-bold text-typography-muted tracking-wider block">Description</span>
                <p className="text-xs text-typography-muted leading-relaxed whitespace-pre-line bg-surface-offWhite border border-surface-light p-5 rounded-2xl">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Add to bag button */}
            <div className="pt-8 border-t border-surface-light mt-8">
              <button
                onClick={handleAddToBag}
                disabled={maxAvailable <= 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-pink text-white py-4.5 text-xs uppercase tracking-widest font-bold transition-colors rounded-xl shadow-lg disabled:bg-surface-light disabled:text-typography-muted disabled:cursor-not-allowed disabled:shadow-none"
              >
                <ShoppingBag className="w-4 h-4" /> {maxAvailable <= 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
export default ProductDetailPage;
