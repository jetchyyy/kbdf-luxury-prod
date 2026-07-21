import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, Package, Tag, Users, Shield,
  MessageSquare, Receipt, QrCode, Settings, ChevronLeft, ChevronRight,
  Store, ShoppingBag, Ticket, Coins
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { clsx } from 'clsx';
 
const NAV_ITEMS = [
  { label: 'Overview',         href: '/admin',                  icon: LayoutDashboard, key: 'overview' },
  { label: 'Analytics',        href: '/admin/analytics',        icon: BarChart3,       key: 'analytics' },
  { label: 'Orders',           href: '/admin/orders',           icon: ShoppingBag,     key: 'orders' },
  { label: 'Installments',     href: '/admin/leeway',           icon: Coins,           key: 'leeway' },
  { label: 'Items',            href: '/admin/items',            icon: Package,         key: 'items' },
  { label: 'Categories',       href: '/admin/categories',       icon: Tag,             key: 'categories' },
  { label: 'Promo Codes',      href: '/admin/promo-codes',      icon: Ticket,          key: 'promo_codes' },
  { label: 'Users',            href: '/admin/users',            icon: Users,           key: 'users' },
  { label: 'Roles',            href: '/admin/roles',            icon: Shield,          key: 'roles' },
  { label: 'Leads',            href: '/admin/leads',            icon: MessageSquare,   key: 'leads' },
  { label: 'Expenses',         href: '/admin/expenses',         icon: Receipt,         key: 'expenses' },
  { label: 'Payment Methods',  href: '/admin/payment-methods',  icon: QrCode,          key: 'payment_methods' },
  { label: 'Settings',         href: '/admin/settings',         icon: Settings,        key: 'settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileMenuOpen, setMobileMenuOpen }: AdminSidebarProps) {
  const { hasAccess, tenant, isSuperadmin } = useAdminAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(item => hasAccess(item.key));

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen?.(false);
  }, [location.pathname, setMobileMenuOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen?.(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className={clsx(
          "fixed md:relative top-0 left-0 bottom-0 flex flex-col bg-[#111827] border-r border-white/5 overflow-visible flex-shrink-0 z-50",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform duration-300 md:transition-none"
        )}
      >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 min-h-[72px]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#fb7a90] to-[#f16881] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {!isSuperadmin && tenant?.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
          )}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-white font-semibold text-sm leading-tight truncate max-w-[160px]">
                {isSuperadmin ? 'EcomSaaS' : (tenant?.name ?? 'Admin')}
              </p>
              <p className="text-white/40 text-[11px] leading-tight">
                {isSuperadmin ? 'Platform Admin' : 'Store Dashboard'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.key}
              to={item.href}
              end={item.href === '/admin'}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-[#fb7a90]/15 text-[#fb7a90]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#fb7a90] rounded-r"
                />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f2937] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={clsx(
        "border-t border-white/5 flex-shrink-0 transition-all overflow-hidden flex items-center justify-center min-h-[52px]",
        collapsed ? "px-2" : "px-4"
      )}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.span
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-medium text-white/30 uppercase tracking-widest whitespace-nowrap"
            >
              Created by ODC
            </motion.span>
          ) : (
            <motion.span
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-medium text-white/30 uppercase tracking-widest"
              title="Created by ODC"
            >
              ODC
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-[#1f2937] border border-white/10 rounded-full items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
    </>
  );
}
