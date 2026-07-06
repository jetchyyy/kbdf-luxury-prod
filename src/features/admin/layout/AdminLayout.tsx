import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/analytics': 'Analytics',
  '/admin/orders': 'Order Verification',
  '/admin/items': 'Item Management',
  '/admin/categories': 'Categories',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/leads': 'Lead Management',
  '/admin/expenses': 'Expense Tracker',
  '/admin/payment-methods': 'Payment Methods & QR',
  '/admin/settings': 'Settings',
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          {children}
        </main>
      </div>
    </div>
  );
}
