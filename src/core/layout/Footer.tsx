import { useTenant } from "../context/TenantContext";

export function Footer() {
  const { tenant } = useTenant();
  const settings = (tenant?.store_settings as any) || {};

  return (
    <footer className="bg-surface-offWhite border-t border-surface-light mt-16 md:mt-32">
      <div className="max-w-[1600px] mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row justify-between gap-16 md:gap-8">
        {/* Left: Newsletter */}
        <div className="w-full md:w-[40%]">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-typography-primary mb-4">
            Newsletter
          </h3>
          <p className="text-sm font-serif text-typography-muted mb-8 max-w-sm leading-relaxed">
            Join our mailing list to receive updates, access to exclusive drops, and more.
          </p>
          <form className="flex w-full max-w-sm border-b border-typography-primary/30 pb-2 relative group focus-within:border-typography-primary transition-colors">
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="w-full bg-transparent text-[10px] tracking-widest uppercase focus:outline-none placeholder:text-typography-muted/50 text-typography-primary"
            />
            <button type="button" className="absolute right-0 bottom-2 text-typography-muted hover:text-brand-navy transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
          {settings.address && (
            <p className="text-[10px] tracking-wider text-typography-muted mt-10 uppercase">
              {settings.address}
            </p>
          )}
        </div>

        {/* Right: Links */}
        <div className="w-full md:w-[60%] flex flex-wrap justify-between md:justify-end gap-12 md:gap-24">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-typography-primary">Explore</h4>
            <ul className="space-y-4 text-[11px] text-typography-muted tracking-wide">
              <li><a href="/shop" className="hover:text-typography-primary transition-colors">Bags</a></li>
              <li><a href="/shop" className="hover:text-typography-primary transition-colors">Wallets</a></li>
              <li><a href="/shop" className="hover:text-typography-primary transition-colors">Watches</a></li>
              <li><a href="/categories" className="hover:text-typography-primary transition-colors">Preloved</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-typography-primary">Support</h4>
            <ul className="space-y-4 text-[11px] text-typography-muted tracking-wide">
              <li><a href="/contact" className="hover:text-typography-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-typography-primary transition-colors">FAQ</a></li>
              <li><a href="/track" className="hover:text-typography-primary transition-colors">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-typography-primary">Socials</h4>
            <ul className="space-y-4 text-[11px] text-typography-muted tracking-wide">
              <li><a href="#" className="hover:text-typography-primary transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-typography-primary transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-typography-primary transition-colors">TikTok</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1600px] mx-auto px-6 py-8 border-t border-surface-light flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-typography-muted tracking-widest uppercase">
        <div>
          © {new Date().getFullYear()} {tenant?.name || "KBDF"}. All Rights Reserved. 
          <span className="mx-2 hidden md:inline">|</span>
          <br className="md:hidden" />
          <span className="md:hidden mt-2 inline-block"></span>
          Site by <a href="https://www.facebook.com/profile.php?id=61587269647950" className="hover:text-typography-primary transition-colors font-semibold" target="_blank" rel="noopener noreferrer">ODC</a>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-typography-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-typography-primary transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
