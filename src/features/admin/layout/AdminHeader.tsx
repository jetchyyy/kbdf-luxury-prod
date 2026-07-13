import { LogOut, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase/supabaseClient';

interface AdminHeaderProps {
  title: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  read: boolean;
  timestamp: Date;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { adminUser, tenant, isSuperadmin, signOut } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('admin-theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('admin-theme', nextTheme);
    window.dispatchEvent(new CustomEvent('admin-theme-change', { detail: nextTheme }));
  };

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setTheme(customEvent.detail);
    };
    window.addEventListener('admin-theme-change', handleThemeChange);
    return () => window.removeEventListener('admin-theme-change', handleThemeChange);
  }, []);

  // Subscribe to real-time orders inserts
  useEffect(() => {
    if (!tenant?.id) return;

    const channel = supabase
      .channel(`admin-orders-realtime-${tenant.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenant.id}`
        },
        (payload: any) => {
          const newOrder = payload.new as any;
          
          setNotifications(prev => [
            {
              id: crypto.randomUUID(),
              title: 'New Order Placed!',
              desc: `Order #${newOrder.tracking_number} by ${newOrder.customer_first_name} ${newOrder.customer_last_name}`,
              read: false,
              timestamp: new Date()
            },
            ...prev
          ]);

          // Synthesize dual-tone crystal bell chime using Web Audio API
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              
              // First chime tone (high harmonic)
              const osc1 = audioCtx.createOscillator();
              const gain1 = audioCtx.createGain();
              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
              gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
              gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
              osc1.connect(gain1);
              gain1.connect(audioCtx.destination);
              osc1.start();
              osc1.stop(audioCtx.currentTime + 1.2);

              // Secondary harmonic tone (slightly delayed chime effect)
              setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E6
                gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.8);
              }, 75);
            }
          } catch (err) {
            console.error('Audio synthesizer error:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id]);

  const initials = adminUser?.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'A';

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

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
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* Notification bell and dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(v => !v)}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fb7a90] ring-2 ring-[#0f1117] animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#1f2937] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-h-96"
              >
                {/* Dropdown Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Alerts ({unreadCount} new)</span>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[#fb7a90] hover:text-[#f16881] text-[10px] font-semibold transition-colors"
                      >
                        Read All
                      </button>
                      <button
                        onClick={handleClearNotifications}
                        className="text-white/40 hover:text-white text-[10px] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-white/30 text-xs">
                      No recent notifications.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                        }}
                        className={`p-4 transition-colors cursor-pointer text-left hover:bg-white/5 relative ${
                          !item.read ? 'bg-[#fb7a90]/5' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-white text-xs font-semibold">{item.title}</p>
                          <span className="text-white/30 text-[9px] flex-shrink-0 mt-0.5">
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-white/50 text-[11px] mt-1 leading-snug">{item.desc}</p>
                        {!item.read && (
                          <span className="absolute left-2 top-4 w-1.5 h-1.5 rounded-full bg-[#fb7a90]" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
