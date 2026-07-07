import { useEffect, useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { ProductGrid } from "../products/components/ProductGrid";
import { Link } from "react-router-dom";
import { useTenant } from "../../core/context/TenantContext";
import { fetchCategories } from "../admin/api/categories";

// Fallback Default Presets
const DEFAULT_HEROS = [
  {
    image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop",
    title: "Payday Special Offer",
    cta_text: "Shop Now",
    cta_link: "/shop"
  },
  {
    image_url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2000&auto=format&fit=crop",
    title: "Exclusive Bags",
    cta_text: "Discover",
    cta_link: "/shop"
  }
];

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
    quote: "Five Stars! This wallet is fantastic. This wallet is durable enough to withstand daily use. I love the design - it's sleek and modern, but also practical with plenty of space for cards and cash/coins. It's the perfect blend of style and functionality. Highly recommend!",
    author: "- Richie A.E.",
    image_url: "https://images.unsplash.com/photo-1628149463056-118bd095dc2b?w=400",
    product_name: "CLASSIC WALLET"
  },
  {
    quote: "Been looking for this kind of design and I really love it! I took the risk to order even if I wasn't sure about my size, but I got it correct! It fits perfectly. Btw, you have to add 1 size up. Thanks! I will definitely order again 😊",
    author: "- MJ G.",
    image_url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400",
    product_name: "KESHI SLIDES"
  },
  {
    quote: "This is actually my second time ordering the same pair of shoes. The quality is excellent, and they're really comfortable to wear. I'm very satisfied with my purchase!",
    author: "- Cyndy",
    image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
    product_name: "EVERYDAY SNEAKERS"
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
  const [currentHero, setCurrentHero] = useState(0);

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

  const heros = homepage.heros || DEFAULT_HEROS;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heros.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heros.length]);

  const editorial = homepage.editorial || DEFAULT_EDITORIAL;
  const collections = homepage.featured_collections || DEFAULT_COLLECTIONS;
  const lifestyle = homepage.lifestyle || DEFAULT_LIFESTYLE;
  const social = homepage.social || DEFAULT_SOCIAL;

  return (
    <div className="w-full min-h-screen bg-surface-white flex flex-col">
      {/* 1. Hero Section Carousel */}
      <section className="relative w-full bg-surface-light mt-[90px] md:mt-[105px] overflow-hidden group">
        <div 
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{ transform: `translateX(-${currentHero * 100}%)` }}
        >
          {heros.map((h: any, idx: number) => (
            <div key={idx} className="w-full shrink-0 relative">
              {h.image_url && (
                <img 
                  src={h.image_url} 
                  alt={h.title} 
                  className="w-full h-auto max-h-[80vh] object-cover opacity-90"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-[8%]">
                <FadeUp>
                  <h1 className="text-4xl md:text-6xl font-serif italic text-typography-primary max-w-lg leading-tight tracking-tight drop-shadow-sm">
                    {h.title}
                  </h1>
                  <Link 
                    to={h.cta_link || "/shop"} 
                    className="mt-6 text-xs font-medium uppercase tracking-widest text-typography-primary border-b border-typography-primary pb-1 inline-block w-max hover:text-brand-pink hover:border-brand-pink transition-colors"
                  >
                    {h.cta_text || "Shop Now"}
                  </Link>
                </FadeUp>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4 text-typography-primary z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setCurrentHero((prev) => (prev - 1 + heros.length) % heros.length)}
            className="hover:text-brand-pink transition-colors"
          >
            ←
          </button>
          <span className="text-xs font-medium">{currentHero + 1} / {heros.length}</span>
          <button 
            onClick={() => setCurrentHero((prev) => (prev + 1) % heros.length)}
            className="hover:text-brand-pink transition-colors"
          >
            →
          </button>
        </div>
      </section>

      {/* 2. Marquee */}
      <div className="w-full bg-surface-white border-b border-surface-light overflow-hidden py-3 flex items-center">
        <div className="animate-marquee inline-flex items-center whitespace-nowrap">
           {[...Array(20)].map((_, i) => (
             <span key={i} className="text-[#d32f2f] font-bold uppercase tracking-widest px-4 text-xs md:text-sm">
               New Arrivals <span className="text-[#d32f2f] mx-4">•</span>
             </span>
           ))}
        </div>
      </div>

      {/* 3. Horizontal Category Strip (Contiguous) */}
      {categories.length > 0 && (
        <section className="w-full bg-surface-white flex overflow-x-auto no-scrollbar">
          {categories.map((cat, i) => (
            <Link key={i} to={`/shop?category=${cat.slug}`} className="group relative min-w-[150px] md:flex-1 aspect-square md:aspect-auto md:h-[250px] overflow-hidden">
              <img src={cat.img} alt={cat.slug} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
              <span className="absolute bottom-4 left-4 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest drop-shadow-md">
                {cat.slug}
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* 3. Product Grid (Latest Arrivals) */}
      <div className="mt-8 border-t border-surface-light pt-12">
        <ProductGrid />
      </div>

      {/* 4. Editorial Bento Grid */}
      <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-surface-light">
          {/* Main Focus Image */}
          <div className="relative aspect-[4/5] md:aspect-auto bg-surface-offWhite overflow-hidden group border-r border-surface-light">
            {editorial.banner_image && (
              <img src={editorial.banner_image} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000" alt="Editorial Focus" />
            )}
            
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10">
              <h2 className="text-3xl md:text-5xl font-serif text-typography-primary mb-3 drop-shadow-sm">{editorial.title}</h2>
              <p className="text-xs md:text-sm text-typography-primary mb-6 font-medium drop-shadow-sm">{editorial.subtitle || "Your next obsession starts here."}</p>
              <Link to={editorial.cta_link || "/shop"} className="text-xs uppercase tracking-widest text-typography-primary border-b border-typography-primary pb-1 font-bold hover:text-brand-pink hover:border-brand-pink transition-colors inline-block">{editorial.cta_text || "Shop Now"}</Link>
            </div>
          </div>

          {/* 4-Square Grid */}
          <div className="grid grid-cols-2 gap-0">
            {(editorial.grid_images || DEFAULT_EDITORIAL.grid_images).map((src: string, i: number) => (
              <div 
                key={i} 
                className={`relative aspect-square bg-surface-offWhite overflow-hidden group 
                  ${i % 2 === 0 ? 'border-r border-surface-light' : ''} 
                  ${i < 2 ? 'border-b border-surface-light' : ''}
                `}
              >
                 <img src={src} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Product Thumbnail" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Collections */}
      <section className="w-full bg-[#f4f2ed] py-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 md:grid md:grid-cols-3">
            {collections.map((col: any, i: number) => (
              <div key={i} className="relative shrink-0 w-[85vw] sm:w-[60vw] md:w-auto snap-center aspect-[4/5] bg-surface-offWhite group overflow-hidden">
                {col.image_url && (
                  <img src={col.image_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={col.title} />
                )}
                {/* Dark gradient at bottom to make white text pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-0 w-full text-center px-4 z-10">
                  <span className="text-white text-2xl font-bold tracking-wide drop-shadow-md">{col.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Slider */}
      <section className="py-24 bg-[#f4f2ed] overflow-hidden">
        <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-10 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-typography-primary">What Our Customers Say</h2>
          <div className="flex gap-4 text-typography-primary/50 text-xl font-light">
            <button className="hover:text-typography-primary transition-colors">←</button>
            <button className="hover:text-typography-primary transition-colors">→</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 max-w-[1600px] mx-auto">
          {DEFAULT_TESTIMONIALS.map((t: any, i: number) => (
            <div key={i} className="bg-white flex h-[280px]">
               {/* Left: Text */}
               <div className="w-[55%] p-6 flex flex-col justify-between">
                 <div>
                   <div className="flex gap-0.5 text-typography-primary mb-4 text-sm tracking-tighter">★★★★★</div>
                   <p className="text-[11px] md:text-xs font-sans text-typography-primary leading-relaxed line-clamp-6">"{t.quote}"</p>
                 </div>
                 <div className="mt-4">
                    <span className="text-[10px] md:text-xs text-typography-primary font-medium">{t.author}</span>
                 </div>
               </div>
               {/* Right: Image */}
               <div className="w-[45%] relative bg-[#f5f5f5] overflow-hidden flex items-center justify-center">
                  {t.image_url && <img src={t.image_url} className="w-full h-full object-cover mix-blend-multiply" alt="product" />}
                  {t.product_name && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
                      <div className="absolute bottom-4 w-full text-center px-2">
                        <span className="text-white text-[8px] md:text-[10px] font-bold tracking-widest uppercase">{t.product_name}</span>
                      </div>
                    </>
                  )}
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
      <section className="py-24 bg-surface-white overflow-hidden">
        <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-10 flex justify-between items-end border-b border-surface-light pb-4">
          <h2 className="text-lg md:text-xl font-sans tracking-[0.2em] font-light text-typography-primary uppercase">
            {social.title || `As Seen On ${social.handle || "@kbdf.ph"}`}
          </h2>
        </div>
        <div className="flex w-full">
          <div className="animate-marquee flex w-max">
            {[...(social.images || DEFAULT_SOCIAL.images), ...(social.images || DEFAULT_SOCIAL.images)].map((src: string, i: number) => (
              <a key={i} href="#" className="relative w-[50vw] md:w-[25vw] lg:w-[20vw] aspect-square group overflow-hidden block shrink-0">
                 <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Instagram Post" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">{social.handle || "@kbdf.ph"}</span>
                 </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
