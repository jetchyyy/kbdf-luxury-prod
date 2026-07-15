import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Menu } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/analytics': 'Analytics',
  '/admin/orders': 'Order Verification',
  '/admin/leeway': 'Leeway Management',
  '/admin/items': 'Item Management',
  '/admin/categories': 'Categories',
  '/admin/promo-codes': 'Promo Codes',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/leads': 'Lead Management',
  '/admin/expenses': 'Expense Tracker',
  '/admin/payment-methods': 'Payment Methods & QR',
  '/admin/settings': 'Settings',
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('admin-theme') as 'dark' | 'light') || 'dark';
  });
  const location = useLocation();
  const { tenant } = useAdminAuth();

  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  useEffect(() => {
    const tenantName = tenant?.name || 'Store Admin';
    document.title = `${title} — ${tenantName}`;
  }, [title, tenant]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setTheme(customEvent.detail);
    };
    window.addEventListener('admin-theme-change', handleThemeChange);
    return () => window.removeEventListener('admin-theme-change', handleThemeChange);
  }, []);

  return (
    <div className={`flex h-screen bg-[#0f1117] overflow-hidden ${theme === 'light' ? 'admin-light-mode' : ''}`}>
      <AdminSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(v => !v)} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AdminHeader title={title} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0f1117]">
          {children}
        </main>
      </div>
    </div>
  );
}
