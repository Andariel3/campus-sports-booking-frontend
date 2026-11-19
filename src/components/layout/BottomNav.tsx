import { Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, CalendarPlus, CalendarCheck, User, Shield } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navItems = [
    {
      label: "Acasă",
      path: "/",
      icon: Home,
    },
    {
      label: "Facilități",
      path: "/facilitati",
      icon: Dumbbell,
    },
    {
      label: "Rezervă",
      path: "/rezerva",
      icon: CalendarPlus,
    },
    {
      label: "Ale mele",
      path: user ? "/rezervarile-mele" : "/login",
      icon: CalendarCheck,
    },
    isAdmin
      ? {
          label: "Admin",
          path: "/admin",
          icon: Shield,
        }
      : {
          label: user ? "Profil" : "Cont",
          path: user ? "/profil" : "/login",
          icon: User,
        },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border shadow-lg pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 px-2"
      aria-label="Navigare mobil"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 min-h-[48px] touch-manipulation",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "relative p-1 rounded-lg transition-colors",
                  isActive ? "bg-primary/10 text-primary" : ""
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.4px]" : "stroke-[1.8px]")} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
