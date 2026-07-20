import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, LogOut, ClipboardList, Heart, Coins } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/CartContext";
import { useTenant } from "../context/TenantContext";
import { useUserAuth } from "../context/UserAuthContext";
import { SearchOverlay } from "./SearchOverlay";
import { useFavorites } from "../../features/favorites/FavoritesContext";

export function LuxuryNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const { openCart, items } = useCart();
  const { tenant } = useTenant();
  const { user, signOut } = useUserAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Latest Arrivals", href: "/latest" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Contact", href: "/contact" },
    { label: "Track", href: "/track" },
  ];

  // Append My Orders to desktop nav if logged in
  if (user) {
    navLinks.push({ label: "My Orders", href: "/orders" });
  }

  const storeSettings = (tenant?.store_settings as any) || {};
  const homepageSettings = storeSettings.homepage || {};
  const announcementText = homepageSettings.announcement_text || "Free Shipping for Orders Over $500";

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserDropdown(false);
      navigate("/");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

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
            {tenant?.logo_url && !logoError ? (
              <img 
                src={tenant.logo_url} 
                alt={tenant.name} 
                className="h-8 max-w-[120px] object-contain" 
                onError={() => setLogoError(true)}
              />
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
        <div className="flex flex-1 items-center justify-end gap-4 lg:gap-6 relative">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="text-typography-primary hover:text-brand-pink transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          {/* User Auth Controls */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                className="flex items-center gap-1.5 text-typography-primary hover:text-brand-pink transition-colors"
                title="Account Menu"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider max-w-[80px] truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
              </button>

              {/* User Dropdown Popover */}
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-surface-light rounded-xl shadow-xl py-2 z-20 animate-fadeIn">
                    <Link 
                      to="/orders" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-typography-primary hover:bg-surface-offWhite font-semibold transition-colors"
                    >
                      <ClipboardList className="w-4 h-4 text-typography-muted" /> Order History
                    </Link>
                    <Link 
                      to="/orders?tab=leeway" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-typography-primary hover:bg-surface-offWhite font-semibold transition-colors"
                    >
                      <Coins className="w-4 h-4 text-typography-muted" /> Installments
                    </Link>
                    <Link 
                      to="/orders?tab=favorites" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-typography-primary hover:bg-surface-offWhite font-semibold transition-colors"
                    >
                      <Heart className="w-4 h-4 text-typography-muted" /> Favorites List
                    </Link>
                    <Link 
                      to="/orders?tab=profile" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-typography-primary hover:bg-surface-offWhite font-semibold transition-colors"
                    >
                      <User className="w-4 h-4 text-typography-muted" /> Profile Settings
                    </Link>
                    <div className="border-t border-surface-light my-1" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 font-semibold transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/auth" className="text-typography-primary hover:text-brand-pink transition-colors" title="Sign In">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}

          {/* Favorites List Trigger */}
          {user && (
            <Link 
              to="/orders?tab=favorites"
              className="text-typography-primary hover:text-brand-pink transition-colors relative"
              title="My Favorites"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-pink text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {favorites.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart trigger */}
          <button onClick={openCart} className="text-typography-primary hover:text-brand-pink transition-colors relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-pink text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
          
          {/* Mobile Hamburger */}
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

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 top-[100px] z-40 bg-surface-white/95 pointer-events-auto flex flex-col py-8 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    to={link.href}
                    className="text-xl font-sans uppercase tracking-widest text-typography-primary hover:text-typography-muted block border-b border-surface-light pb-4"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth button */}
              {user ? (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: navLinks.length * 0.05, duration: 0.4 }}
                  onClick={() => { setIsOpen(false); handleSignOut(); }}
                  className="text-xl font-sans uppercase tracking-widest text-red-500 text-left block border-b border-surface-light pb-4"
                >
                  Sign Out
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: navLinks.length * 0.05, duration: 0.4 }}
                >
                  <Link
                    to="/auth"
                    className="text-xl font-sans uppercase tracking-widest text-typography-primary hover:text-typography-muted block border-b border-surface-light pb-4"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
