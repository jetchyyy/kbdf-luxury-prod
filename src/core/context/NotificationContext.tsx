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
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#f8f5f2] border border-surface-light rounded-sm p-10 shadow-diffusion z-10 text-center flex flex-col items-center"
            >
              {/* Close Button */}
              <button 
                onClick={dismiss}
                className="absolute top-4 right-4 text-typography-muted hover:text-brand-pink transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              {/* Dynamic Icon */}
              <div className="mb-6">
                {config.type === 'success' ? (
                  <div className="w-12 h-12 flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 className="w-10 h-10" strokeWidth={1} />
                  </div>
                ) : config.type === 'error' ? (
                  <div className="w-12 h-12 flex items-center justify-center text-brand-pink mb-2">
                    <AlertTriangle className="w-10 h-10" strokeWidth={1} />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center text-brand-navy mb-2">
                    <CheckCircle2 className="w-10 h-10" strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Title & Message */}
              <h3 className="text-brand-navy font-serif font-bold text-lg uppercase tracking-[0.2em] mb-3">{config.title}</h3>
              <p className="text-typography-muted font-light text-sm tracking-wide leading-relaxed max-w-[260px] mb-8">{config.message}</p>

              {/* Dismiss Button */}
              <button 
                onClick={dismiss}
                className="w-full py-3.5 border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white text-[10px] uppercase font-bold tracking-[0.25em] transition-all duration-300"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#f8f5f2] border border-surface-light rounded-sm p-10 shadow-diffusion z-10 text-center flex flex-col items-center"
            >
              {/* Question Icon */}
              <div className="mb-6">
                <div className="w-12 h-12 flex items-center justify-center text-brand-navy mb-2">
                  <AlertTriangle className="w-10 h-10" strokeWidth={1} />
                </div>
              </div>

              {/* Title & Message */}
              <h3 className="text-brand-navy font-serif font-bold text-lg uppercase tracking-[0.2em] mb-3">{confirmConfig.title}</h3>
              <p className="text-typography-muted font-light text-sm tracking-wide leading-relaxed max-w-[260px] mb-8">{confirmConfig.message}</p>

              {/* Confirm / Cancel Buttons */}
              <div className="flex items-center gap-4 w-full">
                <button 
                  onClick={() => handleConfirmResponse(false)}
                  className="flex-1 py-3.5 border border-brand-navy text-brand-navy hover:bg-surface-light text-[10px] uppercase font-bold tracking-[0.25em] transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleConfirmResponse(true)}
                  className="flex-1 py-3.5 border border-brand-navy bg-brand-navy text-white hover:bg-brand-navy/90 text-[10px] uppercase font-bold tracking-[0.25em] transition-all duration-300"
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
