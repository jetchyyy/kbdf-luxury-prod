import { useEffect, useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { ProductGrid } from "../products/components/ProductGrid";
import { Link } from "react-router-dom";
import { useTenant } from "../../core/context/TenantContext";
import { fetchCategories } from "../admin/api/categories";

// Fallback Default Presets
const DEFAULT_HERO = {
  image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop",
  title: "Payday Special Offer",
  cta_text: "Shop Now",
  cta_link: "/shop"
};

const DEFAULT_EDITORIAL = {
  title: "New In",
  subtitle: "Discover the latest arrivals",
  cta_text: "Shop Now",
  cta_link: "/shop",
  banner_image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1200",
  grid_images: [
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
    "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600",
    "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600"
  ]
};

const DEFAULT_COLLECTIONS = [
  { title: "All Flats", image_url: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800" },
  { title: "Tote Bags", image_url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800" },
  { title: "Sneakers", image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800" },
];

const DEFAULT_TESTIMONIALS = [
  {
    quote: "The bag is absolutely gorgeous! It arrived in perfect condition and the packaging was so luxurious. Will definitely order again.",
    author: "Sarah T.",
    image_url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200"
  },
  {
    quote: "Excellent transaction. The preloved condition of the watches here is unparalleled. Authentic and premium.",
    author: "John D.",
    image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200"
  }
];

const DEFAULT_LIFESTYLE = {
  image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000",
  text: "Where style meets <span class=\"text-brand-peach italic\">value</span> - shoes, bags, and wallets that make you stand out.",
  cta_text: "Shop Now",
  cta_link: "/shop"
};

const DEFAULT_SOCIAL = {
  title: "As Seen On @kbdf.ph",
  handle: "@kbdf.ph",
  images: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    "https://images.unsplash.com/photo-1485230895905-ef0e1261d15c?w=400",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400"
  ]
};

export function HomePage() {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState<any[]>([]);

  // Load category images from the database dynamically
  useEffect(() => {
    if (tenant?.id) {
      fetchCategories(tenant.id)
        .then(data => {
          const list = data
            .filter((c: any) => c.is_active)
            .map((c: any) => ({
              slug: c.slug,
              img: c.image_url || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80"
            }));
          setCategories(list);
        })
        .catch(err => console.error("Error loading home categories:", err));
    }
  }, [tenant]);

  // Read config from JSONB store settings
  const settings = (tenant?.store_settings as any) || {};
  const homepage = settings.homepage || {};

  const hero = homepage.hero || DEFAULT_HERO;
  const editorial = homepage.editorial || DEFAULT_EDITORIAL;
  const collections = homepage.featured_collections || DEFAULT_COLLECTIONS;
  const testimonials = homepage.testimonials || DEFAULT_TESTIMONIALS;
  const lifestyle = homepage.lifestyle || DEFAULT_LIFESTYLE;
  const social = homepage.social || DEFAULT_SOCIAL;

  return (
    <div className="w-full min-h-screen bg-surface-white flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] bg-surface-light pt-[100px]">
        {hero.image_url && (
          <img 
            src={hero.image_url} 
            alt="Hero Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-24">
          <FadeUp>
            <h1 className="text-4xl md:text-6xl font-serif italic text-typography-primary max-w-lg leading-tight tracking-tight drop-shadow-sm">
              {hero.title}
            </h1>
            <Link 
              to={hero.cta_link || "/shop"} 
              className="mt-6 text-xs font-medium uppercase tracking-widest text-brand-navy border-b-2 border-brand-pink pb-1 inline-block w-max hover:text-brand-pink transition-colors"
            >
              {hero.cta_text || "Shop Now"}
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* 2. Horizontal Category Strip */}
      {categories.length > 0 && (
        <section className="w-full bg-surface-offWhite py-2 border-b border-surface-light overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-2 min-w-max">
            {categories.map((cat, i) => (
              <Link key={i} to={`/shop?category=${cat.slug}`} className="group cursor-pointer w-[120px] md:w-[160px]">
                <div className="w-full aspect-square bg-surface-offWhite overflow-hidden">
                  <img src={cat.img} alt="Category" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Product Grid (Latest Arrivals) */}
      <div className="mt-8 border-t border-surface-light pt-12">
        <ProductGrid />
      </div>

      {/* 4. Editorial Bento Grid */}
      <section className="w-full max-w-[1600px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-[4/5] md:aspect-auto bg-surface-offWhite overflow-hidden group">
            {editorial.banner_image && (
              <img src={editorial.banner_image} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000" alt="Editorial Focus" />
            )}
            <div className="absolute bottom-8 left-8">
              <h2 className="text-3xl font-serif text-typography-primary mb-2 drop-shadow-sm">{editorial.title}</h2>
              <p className="text-[10px] tracking-widest uppercase text-brand-pink mb-4 font-bold drop-shadow-sm">{editorial.subtitle}</p>
              <Link to={editorial.cta_link || "/shop"} className="text-[10px] uppercase tracking-widest text-typography-primary border-b-2 border-brand-coral pb-1 font-bold hover:text-brand-coral transition-colors">{editorial.cta_text || "Shop Now"}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(editorial.grid_images || DEFAULT_EDITORIAL.grid_images).map((src: string, i: number) => (
              <div key={i} className="aspect-square bg-surface-offWhite overflow-hidden group">
                 <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Product Thumbnail" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Collections */}
      <section className="w-full max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collections.map((col: any, i: number) => (
            <div key={i} className="relative aspect-[3/4] bg-surface-offWhite group overflow-hidden border-b-4 border-brand-peach">
              {col.image_url && (
                <img src={col.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={col.title} />
              )}
              <div className="absolute bottom-6 left-6">
                <span className="text-white text-sm font-medium tracking-wide drop-shadow-md">{col.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Testimonials Slider */}
      <section className="py-24 bg-surface-white overflow-hidden">
        <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-10 flex justify-between items-end border-b border-surface-light pb-4">
          <h2 className="text-xl md:text-2xl font-serif text-typography-primary">What Our Customers Say</h2>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar max-w-[1600px] mx-auto">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="min-w-[280px] md:min-w-[340px] bg-surface-offWhite p-8 flex flex-col justify-between aspect-square border border-surface-light">
               <div>
                 <div className="flex gap-1 text-brand-peach mb-6 text-sm">★★★★★</div>
                 <p className="text-sm font-serif italic text-typography-primary leading-relaxed">"{t.quote}"</p>
               </div>
               <div className="flex items-end justify-between mt-8">
                  <span className="text-[10px] tracking-widest uppercase text-typography-muted font-medium">{t.author}</span>
                  {t.image_url && <img src={t.image_url} className="w-16 h-16 object-cover" alt="product" />}
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Lifestyle Banner */}
      <section className="relative w-full h-[60vh] min-h-[400px] bg-brand-navy">
        {lifestyle.image_url && (
          <img 
            src={lifestyle.image_url} 
            alt="Lifestyle Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-16">
          <FadeUp>
            <h2 className="text-2xl md:text-4xl font-serif text-white max-w-lg leading-tight mb-4 drop-shadow-md" dangerouslySetInnerHTML={{ __html: lifestyle.text }} />
            <Link to={lifestyle.cta_link || "/shop"} className="text-[10px] uppercase tracking-widest text-brand-pink border-b-2 border-brand-pink pb-1 inline-block w-max hover:text-white transition-colors">
              {lifestyle.cta_text || "Shop Now"}
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* 8. Social Feed Grid */}
      <section className="py-24 bg-surface-white">
        <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-10 flex justify-between items-end border-b border-surface-light pb-4">
          <h2 className="text-lg md:text-xl font-sans tracking-[0.2em] font-light text-typography-primary uppercase">
            {social.title || `As Seen On ${social.handle || "@kbdf.ph"}`}
          </h2>
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar w-full">
          {(social.images || DEFAULT_SOCIAL.images).map((src: string, i: number) => (
            <a key={i} href="#" className="relative min-w-[200px] md:min-w-[20%] aspect-square group overflow-hidden block flex-1">
               <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Instagram Post" />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">{social.handle || "@kbdf.ph"}</span>
               </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
