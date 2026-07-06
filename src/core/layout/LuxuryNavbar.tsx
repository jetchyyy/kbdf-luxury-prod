import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../features/cart/CartContext";
import { useTenant } from "../context/TenantContext";

export function LuxuryNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { openCart, items } = useCart();
  const { tenant } = useTenant();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "New Arrivals", href: "/shop" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Contact", href: "/contact" },
    { label: "Track", href: "/track" },
  ];

  const storeSettings = (tenant?.store_settings as any) || {};
  const homepageSettings = storeSettings.homepage || {};
  const announcementText = homepageSettings.announcement_text || "Free Shipping for Orders Over $500";

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-white border-b border-surface-light">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-brand-peach via-brand-pink to-brand-coral text-brand-navy text-[10px] text-center py-2 uppercase tracking-widest font-bold shadow-sm">
        {announcementText}
      </div>

      {/* Main Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-[1440px] mx-auto">
        
        {/* Left: Logo */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="text-3xl font-sans tracking-[0.15em] uppercase font-bold text-typography-primary flex items-center gap-2">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-8 max-w-[120px] object-contain" />
            ) : (
              tenant?.name || "KBDF"
            )}
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center justify-center gap-8 flex-[2]">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.href}
              className="text-xs uppercase tracking-wider font-medium text-typography-primary hover:text-typography-muted transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-6">
          <button className="text-typography-primary hover:text-brand-pink transition-colors">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <Link to="/auth" className="hidden md:block text-typography-primary hover:text-brand-pink transition-colors">
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <button onClick={openCart} className="text-typography-primary hover:text-brand-pink transition-colors relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-pink text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
          
          {/* Mobile Hamburger Morph */}
          <button 
            className="lg:hidden flex flex-col justify-center items-center w-6 h-6 relative z-50 text-typography-primary ml-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`w-5 h-px bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
            <span className={`w-5 h-px bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`w-5 h-px bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
          </button>
        </div>
      </nav>

      {/* The Modal Expansion for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 top-[100px] z-40 bg-surface-white/95 pointer-events-auto flex flex-col py-12 px-6"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    to={link.href}
                    className="text-2xl font-sans uppercase tracking-widest text-typography-primary hover:text-typography-muted block border-b border-surface-light pb-4"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
