import { Bell } from 'lucide-react';
import { useAdminAuth } from '../../admin/context/AdminAuthContext';

interface SuperAdminHeaderProps {
  title: string;
}

export function SuperAdminHeader({ title }: SuperAdminHeaderProps) {
  const { adminUser } = useAdminAuth();

  const initials = adminUser?.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'SA';

  return (
    <header className="h-16 bg-[#090a0f]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
      <div>
        <h1 className="text-white font-bold text-base tracking-wide">{title}</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Platform Superadmin Panel</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Platform alerts/notifications */}
        <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Admin profile */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/3 border border-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#fb7a90] to-[#2f4065] flex items-center justify-center text-white text-xs font-bold shadow-md">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-white text-xs font-bold leading-tight">{adminUser?.full_name}</p>
            <p className="text-[#fb7a90] text-[9px] uppercase tracking-widest font-extrabold leading-none">Super User</p>
          </div>
        </div>
      </div>
    </header>
  );
}
