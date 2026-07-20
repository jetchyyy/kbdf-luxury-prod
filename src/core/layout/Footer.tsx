import { useTenant } from "../context/TenantContext";

export function Footer() {
  const { tenant } = useTenant();
  const settings = (tenant?.store_settings as any) || {};
  const brandName = tenant?.name || "KBDF";

  return (
    <footer className="bg-surface-offWhite mt-16 md:mt-24 border-t border-surface-light">
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        
        {/* Branding */}
        <h2 className="text-4xl md:text-5xl font-serif text-brand-navy tracking-[0.3em] uppercase font-light mb-12">
          {brandName}
        </h2>

        {/* Newsletter */}
        <div className="w-full max-w-sm mb-12">
           <form className="flex w-full border-b border-typography-primary/40 pb-3 relative group focus-within:border-typography-primary transition-colors">
            <input 
              type="email" 
              placeholder="SUBSCRIBE TO NEWSLETTER" 
              className="w-full bg-transparent text-[10px] tracking-[0.2em] uppercase focus:outline-none placeholder:text-typography-muted/70 text-typography-primary text-center"
            />
            <button type="button" className="absolute right-0 bottom-3 text-typography-muted hover:text-brand-navy transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Socials */}
        <div className="flex items-center gap-8 mb-12">
          <a href="#" className="text-typography-muted hover:text-brand-navy transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" className="text-typography-muted hover:text-brand-navy transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" className="text-typography-muted hover:text-brand-navy transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
        </div>

        {/* Divider */}
        <div className="w-full max-w-[40px] h-px bg-typography-primary/20 mb-12"></div>

        {/* Address */}
        {settings.address && (
          <p className="text-[9px] tracking-[0.2em] text-typography-muted/70 uppercase mb-8 max-w-lg leading-relaxed">
            {settings.address}
          </p>
        )}

        {/* Links & Copyright */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-[9px] text-typography-muted/70 tracking-[0.2em] uppercase">
          <a href="#" className="hover:text-typography-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-typography-primary transition-colors">Privacy</a>
          <span>© {new Date().getFullYear()} {brandName}</span>
          <span>
            Site by <a href="https://www.facebook.com/profile.php?id=61587269647950" className="hover:text-typography-primary transition-colors font-semibold" target="_blank" rel="noopener noreferrer">ODC</a>
          </span>
        </div>

      </div>
    </footer>
  );
}
