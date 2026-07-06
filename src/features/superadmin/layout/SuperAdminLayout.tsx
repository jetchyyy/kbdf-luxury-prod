import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminHeader } from './SuperAdminHeader';

const SUPER_TITLES: Record<string, string> = {
  '/odc': 'Platform Overview',
  '/odc/tenants': 'Tenant Management',
  '/odc/settings': 'Platform Settings',
};

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = SUPER_TITLES[location.pathname] ?? 'Superadmin';

  return (
    <div className="flex h-screen bg-[#07080c] overflow-hidden text-white/90">
      <SuperAdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <SuperAdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#07080c]">
          {children}
        </main>
      </div>
    </div>
  );
}
