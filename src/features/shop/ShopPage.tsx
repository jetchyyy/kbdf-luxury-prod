import { useEffect, useState } from "react";
import { ProductGrid } from "../products/components/ProductGrid";
import { Link, useLocation } from "react-router-dom";
import { fetchCategories } from "../admin/api/categories";
import { TENANT_ID } from "../../lib/supabase/supabaseClient";

export function ShopPage({ isLatest = false }: { isLatest?: boolean }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || undefined;
  
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([
    { id: "all", label: "All Products" }
  ]);

  useEffect(() => {
    // If tenant is set, fetch categories dynamically
    if (TENANT_ID && TENANT_ID !== 'will-be-set-after-migration-seed') {
      fetchCategories(TENANT_ID)
        .then(data => {
          const list = data.map((c: any) => ({
            id: c.slug,
            label: c.name
          }));
          setCategories([{ id: "all", label: "All Products" }, ...list]);
        })
        .catch(err => {
          console.error("Failed to load categories dynamically:", err);
          // Fallback to defaults
          setCategories([
            { id: "all", label: "All Products" },
            { id: "handbags", label: "Handbags" },
            { id: "footwear", label: "Footwear" },
            { id: "wallets", label: "Wallets" },
            { id: "watches", label: "Watches" },
            { id: "accessories", label: "Accessories" },
            { id: "preloved", label: "Preloved" }
          ]);
        });
    } else {
      // Offline fallback
      setCategories([
        { id: "all", label: "All Products" },
        { id: "handbags", label: "Handbags" },
        { id: "footwear", label: "Footwear" },
        { id: "wallets", label: "Wallets" },
        { id: "watches", label: "Watches" },
        { id: "accessories", label: "Accessories" },
        { id: "preloved", label: "Preloved" }
      ]);
    }
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="mb-12 border-b border-surface-light pb-6">
          <h1 className="text-3xl font-serif text-typography-primary">
            {searchQuery ? `Results for "${searchQuery}"` : isLatest ? 'Latest Arrivals' : 'The Collection'}
          </h1>
          <p className="text-[10px] tracking-widest uppercase font-bold text-brand-peach mt-2">
            {isLatest ? 'Discover our newest acquisitions.' : 'Explore our meticulously curated pieces.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar: Categories */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-typography-primary mb-6 border-b border-surface-light pb-2">
              Categories
            </h2>
            <ul className="flex flex-col gap-4">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link 
                    to={cat.id === "all" ? "/shop" : `/shop?category=${cat.id}`}
                    className={`text-sm tracking-wide transition-colors ${
                      currentCategory === cat.id 
                        ? "text-brand-pink font-bold" 
                        : "text-typography-muted hover:text-brand-navy"
                    }`}
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Product Grid */}
          <main className="flex-1">
             <ProductGrid hideHeader category={currentCategory} searchQuery={searchQuery} onlyNewArrivals={isLatest} />
          </main>

        </div>
      </div>
    </div>
  );
}
export default ShopPage;
