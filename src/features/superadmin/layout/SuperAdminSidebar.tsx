import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Globe, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../admin/context/AdminAuthContext';
import { clsx } from 'clsx';

interface SuperAdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SuperAdminSidebar({ collapsed, onToggle }: SuperAdminSidebarProps) {
  const { signOut } = useAdminAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', href: '/odc', icon: LayoutDashboard },
    { label: 'Tenants', href: '/odc/tenants', icon: Globe },
    { label: 'Settings', href: '/odc/settings', icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="relative flex flex-col h-full bg-[#0f111a] border-r border-white/5 overflow-hidden flex-shrink-0"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 min-h-[72px]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#fb7a90] to-[#2f4065] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
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
              <h1 className="text-white font-bold text-sm tracking-wider uppercase leading-none">EcomSaaS</h1>
              <span className="text-[10px] text-white/30 font-semibold tracking-widest uppercase">Super Admin</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = item.href === '/odc'
            ? location.pathname === '/odc'
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/odc'}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-white/5 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/3'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="super-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#fb7a90] rounded-r"
                />
              )}
              <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-[#fb7a90]' : 'text-white/40 group-hover:text-white/60')} strokeWidth={1.5} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-semibold truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f2937] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom log out */}
      <div className="p-2 border-t border-white/5 flex flex-col gap-1">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-sm font-semibold group relative"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1f2937] border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
