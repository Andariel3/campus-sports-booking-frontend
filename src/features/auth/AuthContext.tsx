import { useEffect, useState, ReactNode, useCallback } from "react";
import type { User, UserRole } from "@/api/types";
import { apiClient } from "@/api/client";
import { mapeazaEroareApi } from "@/lib/erori";
import { AuthContext } from "./authContextDefinition";

const TOKEN_KEY = "usv_token";
const USER_KEY = "usv_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const meUser = await apiClient.auth.me();
      if (meUser) {
        setUser(meUser);
        sessionStorage.setItem(USER_KEY, JSON.stringify(meUser));
        localStorage.setItem(USER_KEY, JSON.stringify(meUser));
      }
    } catch {
      // Dacă sesiunea este invalidată pe server
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const tokenData = await apiClient.auth.login(email, password);
      if (tokenData?.accessToken) {
        const receivedToken = tokenData.accessToken;
        setToken(receivedToken);
        sessionStorage.setItem(TOKEN_KEY, receivedToken);
        localStorage.setItem(TOKEN_KEY, receivedToken);

        const meUser = await apiClient.auth.me();
        if (meUser) {
          setUser(meUser);
          sessionStorage.setItem(USER_KEY, JSON.stringify(meUser));
          localStorage.setItem(USER_KEY, JSON.stringify(meUser));
        }

        return { success: true };
      }
      return { success: false, error: "Răspunsul de autentificare nu a inclus un token valid." };
    } catch (err) {
      return { success: false, error: mapeazaEroareApi(err) };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const parts = data.fullName.trim().split(" ");
      const firstName = parts[0] || data.fullName.trim();
      const lastName = parts.slice(1).join(" ") || firstName;

      // Trimitere cu suport complet pentru schema FastAPI (firstName, lastName) și OpenAPI (fullName)
      await apiClient.auth.register({
        email: data.email.trim(),
        password: data.password,
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || undefined,
        ...( { firstName, lastName } as Record<string, string> ),
      });

      return await login(data.email, data.password);
    } catch (err) {
      return { success: false, error: mapeazaEroareApi(err) };
    }
  };

  const role: UserRole | undefined = user?.role as UserRole | undefined;
  const isAdmin = role === "administrator";
  const isStudent = role === "student";
  const isTeacher = role === "profesor";
  const isBlocked = Boolean(user?.isBlocked);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAdmin,
        isStudent,
        isTeacher,
        isBlocked,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
