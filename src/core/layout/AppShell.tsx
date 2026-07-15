import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LuxuryNavbar } from "./LuxuryNavbar";
import { Footer } from "./Footer";
import { SplashScreen } from "../../ui/SplashScreen";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const location = useLocation();
  
  const hiddenFooterPaths = ["/checkout", "/orders", "/auth", "/contact", "/track"];
  const showFooter = !hiddenFooterPaths.includes(location.pathname) && !location.pathname.startsWith("/product/");

  useEffect(() => {
    // Artificial delay for the premium feel
    const timer = setTimeout(() => {
      setIsSplashLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen isLoading={isSplashLoading} />
      <div className="min-h-[100dvh] flex flex-col relative bg-surface-white">
        <LuxuryNavbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        {showFooter && <Footer />}
      </div>
    </>
  );
}
