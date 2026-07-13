import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronDown, Star, ArrowLeft } from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from './api';
import type { Product } from './types';
import { useCart } from '../cart/CartContext';
import { useNotification } from '../../core/context/NotificationContext';
import { ReviewsSection } from './components/ReviewsSection';
import { ProductCarousel } from './components/ProductCarousel';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showError, showSuccess } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('Black'); // Mock color state
  const [errorMsg, setErrorMsg] = useState('');
  
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  
  // Accordion state
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      fetchProductBySlug(slug)
        .then(data => {
          setProduct(data);
          if (data?.sizes && data.sizes.length === 1) {
            setSelectedSize(data.sizes[0].size);
          }
          if (data) {
            fetchProducts().then(related => {
              setRelatedProducts(related.filter(p => p.category_id === data.category_id && p.id !== data.id));
            }).catch(console.error);

            const recentSlugs: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const newRecentSlugs = [data.slug, ...recentSlugs.filter(s => s !== data.slug)].slice(0, 5);
            localStorage.setItem('recentlyViewed', JSON.stringify(newRecentSlugs));

            const slugsToFetch = newRecentSlugs.filter(s => s !== data.slug);
            if (slugsToFetch.length > 0) {
              Promise.all(slugsToFetch.map(s => fetchProductBySlug(s)))
                .then(results => {
                  setRecentProducts(results.filter((p): p is Product => p !== null));
                }).catch(console.error);
            } else {
              setRecentProducts([]);
            }
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

  useEffect(() => {
    setErrorMsg('');
  }, [selectedSize, selectedColor]);

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
          Back to Shop
        </Link>
      </div>
    );
  }

  const hasSizes = product.sizes && product.sizes.length > 0;
  const matchedSizeObj = product.sizes?.find(s => s.size === selectedSize);
  const allSizesOutOfStock = hasSizes && (!product.sizes || product.sizes.every(s => s.quantity <= 0));
  const maxAvailable = allSizesOutOfStock
    ? 0
    : hasSizes
    ? (matchedSizeObj ? matchedSizeObj.quantity : 1)
    : (product.stock_status === 'out_of_stock' ? 0 : (product.stock_quantity ?? 99));

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

    addToCart({
      ...product,
      selectedSize: selectedSize || null
    } as any);

    showSuccess(`${product.title} added to Bag!`);
  };

  // Ensure we have 4 images for the grid, using placeholders if needed
  const displayImages = [
    product.image_urls[0] || '/placeholder.png',
    product.image_urls[1] || product.image_urls[0] || '/placeholder.png',
    product.image_urls[2] || product.image_urls[0] || '/placeholder.png',
    product.image_urls[3] || product.image_urls[0] || '/placeholder.png',
  ];

  const mockColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Beige', hex: '#F5F5DC' }
  ];

  return (
    <div className="bg-surface-white min-h-screen">
      {/* Top Banner (Sale/Promo) */}
      <div className="bg-brand-navy text-white text-xs font-semibold py-2 text-center tracking-widest uppercase">
        Use code WELCOME for 10% off your first purchase
      </div>

      <div className="max-w-[1440px] mx-auto pt-6 px-4 md:px-8">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy hover:text-brand-pink transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="hidden md:block w-px h-4 bg-surface-light"></div>
          
          <div className="text-[10px] uppercase tracking-widest text-typography-muted font-semibold flex items-center flex-wrap gap-1">
            <Link to="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span className="mx-1">/</span>
            <Link to="/shop" className="hover:text-brand-navy transition-colors">Shop</Link>
            <span className="mx-1">/</span>
            <span className="text-typography-primary line-clamp-1 max-w-[200px] md:max-w-none" title={product.title}>{product.title}</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: 2x2 Image Grid */}
          <div className="w-full lg:w-[60%]">
            <div className="grid grid-cols-2 gap-4">
              {displayImages.map((imgUrl, idx) => (
                <div key={idx} className="aspect-[4/5] bg-[#f8f5f2] overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`${product.title} - view ${idx + 1}`}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="w-full lg:w-[40%] flex flex-col py-4 pr-4 lg:pr-8">
            <div className="space-y-8">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-serif text-typography-primary leading-tight mb-2">
                  {product.title}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex text-brand-navy">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-typography-muted font-medium">4.89 (151 Reviews)</span>
                </div>
                <p className="text-xl font-bold text-typography-primary">
                  ₱ {product.price.toLocaleString()}
                </p>
                <p className="text-xs text-typography-muted mt-2">
                  Tax included.
                </p>
                {product.leeway_enabled && (
                  <div className="mt-3 p-3 bg-brand-pink/5 border border-brand-pink/20 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-brand-pink uppercase tracking-wider block text-[10px]">Leeway Plan Available</span>
                    <p className="text-typography-muted text-[11px]">
                      Acquire this item now with a downpayment, then settle the remaining balance in installments (weekly, monthly, or flexible).
                    </p>
                    {product.leeway_down_payment_required && (
                      <p className="text-typography-primary font-semibold text-[11px]">
                        Required Downpayment: PHP {product.leeway_down_payment_amount?.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <p className="text-xs font-bold text-typography-primary uppercase tracking-wider mb-3">
                  Color: {selectedColor}
                </p>
                <div className="flex gap-3">
                  {mockColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? 'border-brand-navy p-0.5' : 'border-transparent'
                      }`}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-surface-light"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              {hasSizes && (
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider">
                    <span className="font-bold text-typography-primary">Select Size</span>
                    <button className="text-typography-muted underline hover:text-brand-navy">Size Guide</button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes?.map((sizeObj) => {
                      const isOutOfStock = sizeObj.quantity <= 0;
                      const isSelected = selectedSize === sizeObj.size;
                      return (
                        <button
                          key={sizeObj.size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(sizeObj.size)}
                          className={`py-3 border text-xs font-medium transition-all ${
                            isOutOfStock
                              ? 'bg-surface-offWhite border-surface-light text-surface-light cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-brand-navy border-brand-navy text-white'
                              : 'bg-white border-typography-primary text-typography-primary hover:bg-surface-offWhite'
                          }`}
                        >
                          {sizeObj.size}
                        </button>
                      );
                    })}
                  </div>
                  {errorMsg && (
                    <p className="text-red-500 text-xs font-medium mt-2">{errorMsg}</p>
                  )}
                </div>
              )}

              {/* Add to bag button */}
              <div className="pt-2">
                <button
                  onClick={handleAddToBag}
                  disabled={maxAvailable <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-brand-navy hover:bg-opacity-90 text-white py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all disabled:bg-surface-light disabled:text-typography-muted disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" /> {maxAvailable <= 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
                <div className="mt-4 flex gap-2 justify-center">
                   <p className="text-[10px] text-typography-muted tracking-wide uppercase text-center flex items-center gap-1">
                      <Star className="w-3 h-3" /> Handcrafted <span className="mx-1">|</span> Premium Quality <span className="mx-1">|</span> Free Returns
                   </p>
                </div>
              </div>

              {/* Accordions */}
              <div className="border-t border-surface-light pt-4 space-y-4">
                
                {/* Product Details Accordion */}
                <div className="border-b border-surface-light pb-4">
                  <button 
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="w-full flex items-center justify-between py-2 text-sm font-bold text-typography-primary uppercase tracking-wider"
                  >
                    Product Details
                    <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {detailsOpen && (
                    <div className="mt-4 text-sm text-typography-muted leading-relaxed whitespace-pre-line pr-4">
                      {product.description || 'Elevate your everyday style with our signature design. Crafted with premium materials for maximum comfort and durability.'}
                      <ul className="mt-4 space-y-2 list-disc pl-5">
                         <li>Material: Premium vegan leather</li>
                         <li>Heel height: 2.5 inches</li>
                         <li>Padded insole for all-day comfort</li>
                         <li>Slip-resistant outsole</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Delivery & Returns Accordion */}
                <div className="border-b border-surface-light pb-4">
                  <button 
                    onClick={() => setDeliveryOpen(!deliveryOpen)}
                    className="w-full flex items-center justify-between py-2 text-sm font-bold text-typography-primary uppercase tracking-wider"
                  >
                    Delivery & Returns
                    <ChevronDown className={`w-4 h-4 transition-transform ${deliveryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {deliveryOpen && (
                    <div className="mt-4 text-sm text-typography-muted leading-relaxed pr-4 space-y-3">
                      <p><strong>Standard Delivery:</strong> 3-5 business days (₱150)</p>
                      <p><strong>Express Delivery:</strong> 1-2 business days (₱250)</p>
                      <p>Free standard delivery on orders over ₱3,000.</p>
                      <p>Returns accepted within 30 days of receipt. Items must be unworn and in original packaging.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete the look */}
              <div className="pt-6">
                 <h3 className="text-sm font-bold font-serif text-typography-primary mb-4">Complete the look</h3>
                 <div className="flex gap-4 border border-surface-light p-4 bg-white">
                    <div className="w-20 h-20 bg-surface-offWhite shrink-0">
                       <img src="/placeholder.png" alt="Wallet" className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                       <p className="text-[10px] text-brand-peach font-bold uppercase tracking-widest mb-1">Accessories</p>
                       <p className="text-sm font-bold text-typography-primary">Quilted Long Wallet</p>
                       <p className="text-sm font-bold text-brand-navy mt-1">₱ 899</p>
                    </div>
                    <div className="flex items-center">
                       <button className="w-8 h-8 flex items-center justify-center border border-typography-primary text-typography-primary hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-colors">
                         +
                       </button>
                    </div>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      {/* Sections below the fold */}
      <ReviewsSection productId={product.id} />
      {recentProducts.length > 0 && <ProductCarousel title="Recently Viewed" products={recentProducts} />}
      {relatedProducts.length > 0 && <ProductCarousel title="You May Also Like" products={relatedProducts} />}
      
    </div>
  );
}

export default ProductDetailPage;
