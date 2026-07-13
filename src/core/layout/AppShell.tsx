import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LuxuryNavbar } from "./LuxuryNavbar";
import { Footer } from "./Footer";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFavoritesTab = location.pathname === "/orders" && searchParams.get("tab") === "favorites";
  const showFooter = location.pathname !== "/checkout" && !isFavoritesTab;

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
