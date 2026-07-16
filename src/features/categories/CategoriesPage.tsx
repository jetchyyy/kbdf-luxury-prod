import { useEffect, useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { Link } from "react-router-dom";
import { fetchStorefrontCategories } from "./api";
import { TENANT_ID } from "../../lib/supabase/supabaseClient";

interface StorefrontCategory {
  title: string;
  subtitle: string;
  image: string;
  colSpan: string;
  accent: string;
}

const DEFAULT_CATEGORIES: StorefrontCategory[] = [
  { 
    title: "Handbags", 
    subtitle: "The ultimate collection",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1200&auto=format&fit=crop",
    colSpan: "col-span-1 md:col-span-2",
    accent: "border-brand-peach"
  },
  { 
    title: "Footwear", 
    subtitle: "Step in style",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1",
    accent: "border-brand-pink"
  },
  { 
    title: "Wallets", 
    subtitle: "Everyday essentials",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1",
    accent: "border-brand-coral"
  },
  { 
    title: "Watches", 
    subtitle: "Timeless pieces",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1 md:col-span-2",
    accent: "border-brand-navy"
  },
  { 
    title: "Accessories", 
    subtitle: "Finishing touches",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1 md:col-span-2",
    accent: "border-brand-peach"
  },
  { 
    title: "Preloved", 
    subtitle: "Vintage archives",
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1",
    accent: "border-brand-pink"
  }
];

export function CategoriesPage() {
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (TENANT_ID && TENANT_ID !== 'will-be-set-after-migration-seed') {
      fetchStorefrontCategories()
        .then(data => {
          const list = data.map((cat: any, idx: number) => ({
            title: cat.name,
            subtitle: cat.description || "Curated pieces",
            image: cat.image_url || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800",
            // Alternate spans for beautiful grid layouts
            colSpan: idx % 3 === 0 || idx % 3 === 2 ? "col-span-1 md:col-span-2" : "col-span-1",
            accent: idx % 3 === 0 ? "border-brand-peach" : idx % 3 === 1 ? "border-brand-pink" : "border-brand-coral"
          }));
          setCategories(list.length > 0 ? list : DEFAULT_CATEGORIES);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to load storefront categories:", err);
          setCategories(DEFAULT_CATEGORIES);
          setIsLoading(false);
        });
    } else {
      setCategories(DEFAULT_CATEGORIES);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-3xl font-serif text-typography-primary mb-4">
            Shop by Category
          </h1>
          <div className="w-16 h-1 bg-brand-pink mb-6"></div>
          <p className="max-w-md text-[10px] tracking-[0.2em] uppercase font-bold text-typography-muted">
            Explore our curated collections of luxury goods, from timeless handbags to vintage archives.
          </p>
        </div>

        {/* Editorial Bento Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-surface-light h-[350px] md:h-[450px] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category, idx) => (
              <FadeUp key={category.title} delay={idx * 0.1} className={category.colSpan}>
                <Link to={`/shop?category=${category.title.toLowerCase()}`} className={`group relative block w-full h-[350px] md:h-[450px] overflow-hidden border-b-4 ${category.accent} bg-surface-offWhite`}>
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Text Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] tracking-widest text-brand-peach uppercase font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {category.subtitle}
                    </p>
                    <h3 className="text-3xl font-serif text-white drop-shadow-md">
                      {category.title}
                    </h3>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      <span className="text-[10px] uppercase tracking-widest text-white border-b-2 border-brand-pink pb-1 font-bold">
                        Explore
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
export default CategoriesPage;
