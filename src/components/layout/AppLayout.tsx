import { ReactNode } from "react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import BottomNav from "./BottomNav";
import { useAuth } from "@/features/auth/useAuth";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <AppHeader user={user} onLogout={logout} />
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
      <BottomNav />
      <div className="hidden md:block">
        <AppFooter />
      </div>
    </div>
  );
}

export default AppLayout;
