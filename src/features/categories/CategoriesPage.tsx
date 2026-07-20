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
    image: "",
    colSpan: "col-span-1 md:col-span-2",
    accent: "border-brand-peach"
  },
  { 
    title: "Footwear", 
    subtitle: "Step in style",
    image: "",
    colSpan: "col-span-1",
    accent: "border-brand-pink"
  },
  { 
    title: "Wallets", 
    subtitle: "Everyday essentials",
    image: "",
    colSpan: "col-span-1",
    accent: "border-brand-coral"
  },
  { 
    title: "Watches", 
    subtitle: "Timeless pieces",
    image: "",
    colSpan: "col-span-1 md:col-span-2",
    accent: "border-brand-navy"
  },
  { 
    title: "Accessories", 
    subtitle: "Finishing touches",
    image: "",
    colSpan: "col-span-1 md:col-span-2",
    accent: "border-brand-peach"
  },
  { 
    title: "Preloved", 
    subtitle: "Vintage archives",
    image: "",
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
            image: cat.image_url || "",
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
              <div key={i} className="animate-pulse bg-surface-light h-[400px] md:h-[550px] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category, idx) => (
              <FadeUp key={category.title} delay={idx * 0.1} className={category.colSpan}>
                <Link to={`/shop?category=${category.title.toLowerCase()}`} className="group relative block w-full h-[400px] md:h-[550px] overflow-hidden bg-surface-offWhite">
                  {category.image && (
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                    />
                  )}
                  {/* Luxury Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700"></div>
                  
                  {/* Inner subtle border */}
                  <div className="absolute inset-4 border border-white/10 group-hover:border-white/30 transition-colors duration-700 pointer-events-none"></div>

                  {/* Text Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    <h3 className="text-4xl md:text-5xl font-serif text-white mb-2 drop-shadow-lg tracking-wide">
                      {category.title}
                    </h3>
                    <p className="text-[10px] tracking-[0.3em] text-brand-peach uppercase font-medium mb-6 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-y-2 group-hover:translate-y-0">
                      {category.subtitle}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 transform translate-y-2 group-hover:translate-y-0">
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white hover:text-brand-pink transition-colors">
                        Explore Collection <span className="text-brand-pink">→</span>
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
