import { LogOut, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AnimatePresence, motion } from 'framer-motion';

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { adminUser, tenant, isSuperadmin, signOut } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = adminUser?.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'A';

  return (
    <header className="h-16 bg-[#0f1117]/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <div>
        <h1 className="text-white font-semibold text-base">{title}</h1>
        {tenant && (
          <p className="text-white/40 text-xs">{tenant.name}</p>
        )}
        {isSuperadmin && (
          <p className="text-[#fb7a90] text-xs font-medium">Superadmin — Platform View</p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder) */}
        <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {adminUser?.avatar_url ? (
              <img src={adminUser.avatar_url} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#fb7a90] to-[#2f4065] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-white text-xs font-medium leading-tight">{adminUser?.full_name}</p>
              <p className="text-white/40 text-[10px] leading-tight">{isSuperadmin ? 'Superadmin' : 'Admin'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#1f2937] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white text-sm font-medium truncate">{adminUser?.email}</p>
                  {isSuperadmin && (
                    <span className="text-[10px] bg-[#fb7a90]/20 text-[#fb7a90] px-1.5 py-0.5 rounded font-medium">
                      Superadmin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
