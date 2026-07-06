import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface NotificationConfig {
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}

interface ConfirmConfig {
  message: string;
  title?: string;
  resolve: (value: boolean) => void;
}

interface NotificationContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  dismiss: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Auto close timer
  useEffect(() => {
    if (config) {
      const timer = setTimeout(() => {
        setConfig(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [config]);

  const showSuccess = (message: string, title?: string) => {
    setConfig({ type: 'success', message, title: title || 'Success' });
  };

  const showError = (message: string, title?: string) => {
    setConfig({ type: 'error', message, title: title || 'Error Occurred' });
  };

  const showInfo = (message: string, title?: string) => {
    setConfig({ type: 'info', message, title: title || 'Information' });
  };

  const showConfirm = (message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmConfig({
        message,
        title: title || 'Confirm Action',
        resolve
      });
    });
  };

  const handleConfirmResponse = (response: boolean) => {
    if (confirmConfig) {
      confirmConfig.resolve(response);
      setConfirmConfig(null);
    }
  };

  const dismiss = () => setConfig(null);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, showConfirm, dismiss }}>
      {children}

      {/* SUCCESS / ERROR / INFO MODAL */}
      <AnimatePresence>
        {config && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop filter blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismiss}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 text-center flex flex-col items-center"
            >
              {/* Close Button */}
              <button 
                onClick={dismiss}
                className="absolute top-3.5 right-3.5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Dynamic Icon */}
              <div className="mb-4">
                {config.type === 'success' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 animate-pulse">
                    <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                ) : config.type === 'error' ? (
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 animate-pulse">
                    <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 animate-pulse">
                    <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              {/* Title & Message */}
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-1.5">{config.title}</h3>
              <p className="text-white/70 text-xs leading-relaxed max-w-[260px]">{config.message}</p>

              {/* Dismiss Button */}
              <button 
                onClick={dismiss}
                className="mt-5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg border border-white/5 transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmConfig && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop filter blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirmResponse(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 flex flex-col items-center text-center"
            >
              {/* Question Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>

              {/* Title & Message */}
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">{confirmConfig.title}</h3>
              <p className="text-white/70 text-xs leading-relaxed max-w-[260px]">{confirmConfig.message}</p>

              {/* Confirm / Cancel Buttons */}
              <div className="flex items-center gap-3 w-full mt-6">
                <button 
                  onClick={() => handleConfirmResponse(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl border border-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleConfirmResponse(true)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white text-[11px] uppercase font-bold tracking-wider rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
