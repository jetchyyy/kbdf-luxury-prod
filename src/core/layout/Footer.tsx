import { useTenant } from "../context/TenantContext";

export function Footer() {
  const { tenant } = useTenant();
  const settings = (tenant?.store_settings as any) || {};

  return (
    <footer className="bg-surface-offWhite text-typography-primary py-24 px-6 md:px-12 border-t border-surface-light mt-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-sans tracking-[0.15em] uppercase font-bold mb-6 text-typography-primary flex items-center gap-2">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-8 max-w-[120px] object-contain" />
            ) : (
              tenant?.name || "KBDF"
            )}
          </h2>
          <p className="text-typography-muted max-w-sm text-xs leading-relaxed">
            Experience the "Quiet Luxury". We curate the finest selection of premium bags, watches, and preloved fashion items.
          </p>
          {settings.address && (
            <p className="text-typography-muted max-w-sm text-xs leading-relaxed mt-4">
              <strong>Address:</strong> {settings.address}
            </p>
          )}
        </div>
        
        <div>
          <h3 className="text-[10px] tracking-widest uppercase font-medium mb-6 text-typography-primary">Explore</h3>
          <ul className="space-y-4 text-xs text-typography-muted">
            <li><a href="/shop" className="hover:text-typography-primary transition-colors">Bags</a></li>
            <li><a href="/shop" className="hover:text-typography-primary transition-colors">Wallets</a></li>
            <li><a href="/shop" className="hover:text-typography-primary transition-colors">Watches</a></li>
            <li><a href="/categories" className="hover:text-typography-primary transition-colors">Preloved</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-[10px] tracking-widest uppercase font-medium mb-6 text-typography-primary">Assistance & Contact</h3>
          <ul className="space-y-4 text-xs text-typography-muted">
            {settings.email && (
              <li>
                <span className="font-semibold block text-[10px] uppercase text-typography-primary/60">Email</span>
                <a href={`mailto:${settings.email}`} className="hover:text-typography-primary transition-colors">{settings.email}</a>
              </li>
            )}
            {settings.phone && (
              <li>
                <span className="font-semibold block text-[10px] uppercase text-typography-primary/60">Phone</span>
                <span className="text-typography-muted">{settings.phone}</span>
              </li>
            )}
            {settings.hours && (
              <li>
                <span className="font-semibold block text-[10px] uppercase text-typography-primary/60">Hours</span>
                <span className="text-typography-muted block">Mon-Fri: {settings.hours.monday_friday}</span>
                <span className="text-typography-muted block">Sat: {settings.hours.saturday}</span>
                <span className="text-typography-muted block">Sun: {settings.hours.sunday}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-typography-primary/10 flex flex-col md:flex-row justify-between items-center text-xs text-typography-muted">
        <p>© {new Date().getFullYear()} {tenant?.name || "KBDF Luxury Store"}. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0 uppercase tracking-widest text-[10px]">
          <a href="#" className="hover:text-typography-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-typography-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
