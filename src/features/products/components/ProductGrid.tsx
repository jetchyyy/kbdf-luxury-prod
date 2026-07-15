import { useEffect, useState } from "react";
import type { Product } from "../types";
import { fetchProducts } from "../api";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  hideHeader?: boolean;
  category?: string;
  searchQuery?: string;
  onlyNewArrivals?: boolean;
}

export function ProductGrid({ hideHeader = false, category = "all", searchQuery, onlyNewArrivals = false }: ProductGridProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts(category, searchQuery, onlyNewArrivals).then(data => {
      setProducts(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [category, searchQuery]);

  return (
    <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto">
      
      {!hideHeader && (
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary mb-4">
            Latest Arrivals
          </h2>
          <div className="w-12 h-px bg-typography-primary mb-6"></div>
          <p className="max-w-md text-xs tracking-wider text-typography-muted">
            Discover our newest acquisitions of highly sought-after pieces.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="p-2 md:p-4">
              <div className="animate-pulse bg-surface-light w-full aspect-[4/5] mb-4"></div>
              <div className="animate-pulse bg-surface-light h-4 w-3/4 mb-2"></div>
              <div className="animate-pulse bg-surface-light h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-typography-muted text-sm uppercase tracking-widest font-light">
          No products found under this collection.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-surface-light">
          {products.map((product, idx) => (
            <div key={product.id}>
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      )}
      
    </section>
  );
}
