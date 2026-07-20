import { useEffect, useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { ProductGrid } from "../products/components/ProductGrid";
import { Link } from "react-router-dom";
import { useTenant } from "../../core/context/TenantContext";
import { fetchCategories } from "../admin/api/categories";
import { ArrowUp } from "lucide-react";

// Fallback Default Presets
const DEFAULT_HEROS = [
  {
    image_url: "",
    title: "Payday Special Offer",
    cta_text: "Shop Now",
    cta_link: "/shop"
  },
  {
    image_url: "",
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
  banner_image: "",
  grid_images: [
    "",
    "",
    "",
    ""
  ]
};

const DEFAULT_COLLECTIONS = [
  { title: "All Flats", image_url: "" },
  { title: "Tote Bags", image_url: "" },
  { title: "Sneakers", image_url: "" },
];

const DEFAULT_TESTIMONIALS = [
  {
    quote: "Five Stars! This wallet is fantastic. This wallet is durable enough to withstand daily use. I love the design - it's sleek and modern, but also practical with plenty of space for cards and cash/coins. It's the perfect blend of style and functionality. Highly recommend!",
    author: "- Richie A.E.",
    image_url: "",
    product_name: "CLASSIC WALLET"
  },
  {
    quote: "Been looking for this kind of design and I really love it! I took the risk to order even if I wasn't sure about my size, but I got it correct! It fits perfectly. Btw, you have to add 1 size up. Thanks! I will definitely order again 😊",
    author: "- MJ G.",
    image_url: "",
    product_name: "KESHI SLIDES"
  },
  {
    quote: "This is actually my second time ordering the same pair of shoes. The quality is excellent, and they're really comfortable to wear. I'm very satisfied with my purchase!",
    author: "- Cyndy",
    image_url: "",
    product_name: "EVERYDAY SNEAKERS"
  }
];

const DEFAULT_LIFESTYLE = {
  image_url: "",
  text: "Where style meets <span class=\"text-brand-peach italic\">value</span> - shoes, bags, and wallets that make you stand out.",
  cta_text: "Shop Now",
  cta_link: "/shop"
};

const DEFAULT_SOCIAL = {
  title: "As Seen On @kbdf.ph",
  handle: "@kbdf.ph",
  images: [
    "",
    "",
    "",
    "",
    ""
  ]
};

export function HomePage() {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState<any[]>([]);
  const [currentHero, setCurrentHero] = useState(0);
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFAB(true);
      } else {
        setShowFAB(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load category images from the database dynamically
  useEffect(() => {
    if (tenant?.id) {
      fetchCategories(tenant.id)
        .then(data => {
          const list = data
            .filter((c: any) => c.is_active)
            .map((c: any) => ({
              slug: c.slug,
              img: c.image_url || ""
            }));
          setCategories(list);
        })
        .catch(err => console.error("Error loading home categories:", err));
    }
  }, [tenant]);

  // Read config from JSONB store settings
  const settings = (tenant?.store_settings as any) || {};
  const homepage = settings.homepage || {};

  const testimonials = homepage.testimonials?.length > 0
    ? homepage.testimonials
    : DEFAULT_TESTIMONIALS;

  const heros = homepage.heros?.length > 0 
    ? homepage.heros 
    : (homepage.hero?.image_url ? [homepage.hero] : DEFAULT_HEROS);

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
                  className="w-full h-[70vh] md:h-[80vh] object-cover object-top opacity-90"
                />
              )}
              
              {/* Subtle gradient overlay to ensure dark text readability */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/50 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-[8%] z-10">
                <FadeUp>
                  <h1 className="text-4xl md:text-6xl font-serif italic text-typography-primary max-w-lg leading-tight tracking-tight drop-shadow-md">
                    {h.title}
                  </h1>
                  <Link 
                    to={h.cta_link || "/shop"} 
                    className="mt-6 text-xs font-medium uppercase tracking-widest text-typography-primary border-b border-typography-primary pb-1 inline-block w-max hover:text-brand-pink hover:border-brand-pink transition-colors drop-shadow-sm"
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
               Latest Arrivals <span className="text-[#d32f2f] mx-4">•</span>
             </span>
           ))}
        </div>
      </div>

      {/* 3. Horizontal Category Strip (Contiguous) */}
      {categories.length > 0 && (
        <section className="w-full bg-surface-white flex overflow-x-auto no-scrollbar">
          {categories.map((cat, i) => (
            <Link key={i} to={`/shop?category=${cat.slug}`} className="group relative min-w-[150px] md:flex-1 aspect-square md:aspect-auto md:h-[350px] overflow-hidden bg-surface-offWhite flex items-center justify-center">
              {cat.img ? (
                <img src={cat.img} alt={cat.slug} className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110" />
              ) : (
                <span className="text-brand-navy/30 text-xs font-bold uppercase tracking-widest">{cat.slug}</span>
              )}
              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <span className="text-white text-lg md:text-2xl font-serif tracking-widest drop-shadow-md">
                  {cat.slug}
                </span>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <span className="text-[10px] uppercase tracking-widest text-brand-peach pb-1 font-medium">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* 3. Product Grid (Latest Arrivals) */}
      <div className="mt-8 border-t border-surface-light pt-12">
        <ProductGrid onlyNewArrivals={true} />
      </div>

      {/* 4. Editorial Bento Grid */}
      <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-white">
          {/* Main Focus Image */}
          <div className="relative aspect-[4/5] md:aspect-auto bg-surface-offWhite overflow-hidden group">
            {editorial.banner_image && (
              <img src={editorial.banner_image} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out" alt="Editorial Focus" />
            )}
            
            {/* Subtle gradient overlay to ensure dark text readability */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/50 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="absolute bottom-8 left-8 md:bottom-16 md:left-12 z-10 max-w-sm">
              <h2 className="text-5xl md:text-7xl font-serif italic text-brand-navy mb-4 drop-shadow-md">{editorial.title}</h2>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-brand-navy mb-10 font-medium drop-shadow-sm leading-relaxed">{editorial.subtitle || "Your next obsession starts here."}</p>
              <Link to={editorial.cta_link || "/shop"} className="inline-block px-10 py-4 border border-brand-navy text-[10px] uppercase font-bold tracking-[0.25em] text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-500 backdrop-blur-sm bg-white/10 shadow-sm">
                {editorial.cta_text || "Shop Now"}
              </Link>
            </div>
          </div>

          {/* 4-Square Grid */}
          <div className="grid grid-cols-2 gap-[2px] bg-white">
            {(editorial.grid_images || DEFAULT_EDITORIAL.grid_images).map((src: string, i: number) => (
              <div 
                key={i} 
                className="relative aspect-square bg-surface-offWhite overflow-hidden group flex items-center justify-center"
              >
                 {src ? (
                   <img src={src} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" alt="Product Thumbnail" />
                 ) : (
                   <span className="text-brand-navy/20 text-xs uppercase tracking-widest">Image</span>
                 )}
                 {/* Elegant hover overlay */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Collections */}
      <section className="w-full bg-surface-white py-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
            {collections.map((col: any, i: number) => (
              <Link 
                key={i} 
                to={`/shop?search=${encodeURIComponent(col.title)}`}
                className="relative aspect-[4/5] bg-surface-offWhite group overflow-hidden block"
              >
                {col.image_url && (
                  <img src={col.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110" alt={col.title} />
                )}
                {/* Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700"></div>
                
                {/* Inner subtle border */}
                <div className="absolute inset-4 border border-white/10 group-hover:border-white/30 transition-colors duration-700 pointer-events-none"></div>

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                  <span className="text-white text-3xl md:text-4xl font-serif tracking-wide drop-shadow-lg mb-2">
                    {col.title}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-y-2 group-hover:translate-y-0">
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-peach transition-colors">
                      Explore Collection <span className="text-white">→</span>
                    </span>
                  </div>
                </div>
              </Link>
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
        <div className={`grid grid-cols-1 ${
          testimonials.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 
          testimonials.length === 1 ? 'max-w-md' : 'md:grid-cols-3'
        } gap-6 px-4 md:px-8 max-w-[1600px] mx-auto`}>
          {testimonials.map((t: any, i: number) => (
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
              <a key={i} href="#" className="relative w-[50vw] md:w-[25vw] lg:w-[20vw] aspect-[4/5] group overflow-hidden block shrink-0 bg-brand-navy/5 flex items-center justify-center">
                 {src ? (
                   <img src={src} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" alt="Instagram Post" />
                 ) : (
                   <span className="text-brand-navy/20 font-bold uppercase tracking-widest text-xs">Social</span>
                 )}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">{social.handle || "@kbdf.ph"}</span>
                 </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top FAB */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 bg-brand-navy text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform ${showFAB ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'} hover:bg-brand-pink hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(251,122,144,0.3)] focus:outline-none`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
