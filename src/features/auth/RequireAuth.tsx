import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { UserRole } from "@/api/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={["administrator"]}>{children}</RequireAuth>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-4 max-w-md">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "administrator" ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
}

export default RequireAuth;
