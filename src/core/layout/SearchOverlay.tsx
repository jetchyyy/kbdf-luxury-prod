import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../features/products/api';
import type { Product } from '../../features/products/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      fetchProducts(undefined, trimmed)
        .then((data) => {
          setResults(data);
          setIsSearching(false);
        })
        .catch((err) => {
          console.error('Search failed:', err);
          setIsSearching(false);
        });
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleViewAll = () => {
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-3xl flex flex-col"
        >
          {/* Header & Search Input */}
          <div className="w-full max-w-[1440px] mx-auto px-6 py-8 md:py-12 flex flex-col gap-8 relative h-full">
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:top-12 md:right-12 p-3 text-typography-primary hover:text-brand-navy bg-white hover:bg-surface-offWhite rounded-full transition-all z-10 shadow-sm border border-surface-light/50"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1} />
            </button>

            <div className="w-full max-w-4xl mx-auto mt-12 md:mt-24 relative">
              <div className="flex items-center border-b border-brand-navy pb-4 transition-all">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-brand-navy mr-6" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent text-3xl md:text-5xl font-serif text-brand-navy outline-none placeholder:text-typography-muted/30 tracking-tight"
                />
              </div>

              {/* Loading Indicator */}
              {isSearching && (
                <div className="absolute -bottom-8 left-0 text-[10px] uppercase tracking-widest text-typography-muted animate-pulse">
                  Searching the collection...
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto no-scrollbar pb-12">
              {query.trim() && !isSearching && results.length === 0 ? (
                <div className="text-center py-32 text-typography-muted uppercase tracking-widest text-xs font-medium">
                  No products found for "{query}"
                </div>
              ) : (
                <div className="flex flex-col mt-8">
                  {results.slice(0, 8).map((product, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      key={product.id}
                      onClick={() => handleResultClick(product.slug)}
                      className="group cursor-pointer flex items-center justify-between py-4 border-b border-surface-light hover:border-brand-navy transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-20 md:w-16 md:h-24 bg-surface-offWhite overflow-hidden relative flex-shrink-0">
                          <img 
                            src={product.image_urls[0] || '/placeholder.png'} 
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                          />
                        </div>
                        <div className="flex flex-col max-w-[200px] md:max-w-md">
                          <h3 className="text-[9px] font-bold text-typography-muted uppercase tracking-[0.15em] mb-1 group-hover:text-brand-navy transition-colors">
                            {product.brand}
                          </h3>
                          <p className="text-sm md:text-base font-serif text-typography-primary line-clamp-2">
                            {product.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right pl-4">
                        <p className="text-[11px] md:text-xs font-bold text-brand-navy tracking-widest">
                          ₱ {product.price.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {results.length > 8 && (
                <div className="flex justify-center mt-20">
                  <button 
                    onClick={handleViewAll}
                    className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-navy pb-1 text-brand-navy hover:text-brand-pink hover:border-brand-pink transition-colors"
                  >
                    View All {results.length} Results
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
