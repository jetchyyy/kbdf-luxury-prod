import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LuxuryNavbar } from "./LuxuryNavbar";
import { Footer } from "./Footer";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const hiddenFooterPaths = ["/checkout", "/orders", "/auth", "/contact", "/track"];
  const showFooter = !hiddenFooterPaths.includes(location.pathname) && !location.pathname.startsWith("/product/");

  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-surface-white">
      <LuxuryNavbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
