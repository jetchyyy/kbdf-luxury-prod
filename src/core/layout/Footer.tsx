import { useTenant } from "../context/TenantContext";

export function Footer() {
  const { tenant } = useTenant();
  const settings = (tenant?.store_settings as any) || {};

  return (
    <footer className="bg-[#f4f2ed] text-typography-primary mt-16 md:mt-32">
      {/* Top Bar: Value Props */}
      <div className="border-t border-b border-surface-light w-full">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row">
          <div className="flex-1 border-r border-surface-light p-6 md:p-8 flex items-center justify-center md:justify-center gap-4">
             {/* Icon placeholder */}
             <div className="w-8 h-8 border border-typography-primary flex items-center justify-center shrink-0">
               <span className="text-xs">↑</span>
             </div>
             <div>
               <h4 className="text-xs font-bold font-sans text-typography-primary mb-1">Free Delivery</h4>
               <p className="text-[10px] text-typography-muted">For orders ₱995 and above</p>
             </div>
          </div>
          <div className="flex-1 p-6 md:p-8 flex items-center justify-center md:justify-center gap-4">
             <div className="w-8 h-8 border border-typography-primary flex items-center justify-center shrink-0 rounded-full">
               <span className="text-xs">↻</span>
             </div>
             <div>
               <h4 className="text-xs font-bold font-sans text-typography-primary mb-1">Free Returns</h4>
               <p className="text-[10px] text-typography-muted">Within 30 days of invoice date</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row border-b border-surface-light">
        {/* Left Side: Newsletter & Brand Info */}
        <div className="w-full md:w-[45%] p-8 md:p-14 md:border-r border-surface-light">
          <h3 className="text-sm md:text-base font-bold font-sans text-typography-primary mb-6 pr-8 leading-relaxed">
            Join us and be the first to know about new arrivals, special drops, and exclusive offers.
          </h3>
          <div className="flex w-full mb-10 max-w-md">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 border border-surface-light bg-white px-4 py-3 text-xs focus:outline-none focus:border-brand-peach"
            />
            <button className="bg-transparent border-y border-r border-surface-light px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-light transition-colors">
              Subscribe
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="text-[10px] font-bold mb-2">Simply KBDF</h4>
            <p className="text-[10px] text-typography-muted leading-relaxed max-w-xs">
              We curate the finest selection of premium bags, watches, and preloved fashion items.
            </p>
          </div>
          {settings.address && (
            <p className="text-[10px] text-typography-muted mt-2">
              {settings.address}
            </p>
          )}
        </div>

        {/* Right Side: Links */}
        <div className="w-full md:w-[55%] p-8 md:p-14 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xs font-bold mb-6 text-typography-primary">Explore</h4>
            <ul className="space-y-4 text-[11px] text-typography-primary font-medium">
              <li><a href="/shop" className="hover:text-brand-peach transition-colors">Bags</a></li>
              <li><a href="/shop" className="hover:text-brand-peach transition-colors">Wallets</a></li>
              <li><a href="/shop" className="hover:text-brand-peach transition-colors">Watches</a></li>
              <li><a href="/categories" className="hover:text-brand-peach transition-colors">Preloved</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold mb-6 text-typography-primary">Support</h4>
            <ul className="space-y-4 text-[11px] text-typography-primary font-medium">
              <li><a href="/contact" className="hover:text-brand-peach transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">Returns & Exchanges</a></li>
              <li><a href="/track" className="hover:text-brand-peach transition-colors">Track My Order</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold mb-6 text-typography-primary">Find Us</h4>
            <ul className="space-y-4 text-[11px] text-typography-primary font-medium">
              <li><a href="#" className="hover:text-brand-peach transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">Tiktok</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">Shopee</a></li>
              <li><a href="#" className="hover:text-brand-peach transition-colors">Zalora</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1600px] mx-auto p-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-typography-muted">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <span>
            © {new Date().getFullYear()} {tenant?.name || "KBDF"}. All Rights Reserved. Created by:{" "}
            <a href="https://www.facebook.com/profile.php?id=61587269647950" target="_blank" rel="noopener noreferrer" className="hover:text-typography-primary font-semibold transition-colors">ODC</a>
            {" "} | {" "}
            <a href="https://odysseyph.com/" target="_blank" rel="noopener noreferrer" className="hover:text-typography-primary font-semibold transition-colors">Website</a>
          </span>
          <a href="#" className="hover:text-typography-primary transition-colors pl-2">Terms of Service</a>
          <a href="#" className="hover:text-typography-primary transition-colors">Privacy Policy</a>
        </div>
        <div className="flex gap-1.5 mt-4 md:mt-0">
          <div className="w-8 h-5 bg-[#1434CB] rounded-sm flex items-center justify-center text-white text-[7px] font-bold">VISA</div>
          <div className="w-8 h-5 bg-[#EB001B] rounded-sm flex items-center justify-center text-white text-[7px] font-bold">MC</div>
          <div className="w-8 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white text-[7px] font-bold">BPI</div>
        </div>
      </div>
    </footer>
  );
}
