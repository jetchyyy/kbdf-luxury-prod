import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "../core/context/TenantContext";

interface SplashScreenProps {
  isLoading: boolean;
}

export function SplashScreen({ isLoading }: SplashScreenProps) {
  const { tenant } = useTenant();
  const [logoError, setLogoError] = useState(false);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-white"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col items-center justify-center gap-8"
          >
            {tenant?.logo_url && !logoError ? (
              <img 
                src={tenant.logo_url} 
                alt={tenant?.name || "Luxury Store"} 
                className="h-10 md:h-14 max-w-[200px] object-contain" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-sans tracking-[0.25em] uppercase font-bold text-typography-primary">
                {tenant?.name || "KBDF"}
              </h1>
            )}
            
            {/* Minimalist Loading Indicator */}
            <div className="w-24 h-[1px] bg-surface-light overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-typography-primary"
                initial={{ width: "0%", left: "0%" }}
                animate={{ 
                  width: ["0%", "50%", "0%"],
                  left: ["0%", "50%", "100%"]
                }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
