import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/features/auth/AuthContext";
import { RequireAuth, RequireAdmin, RequireGuest } from "@/features/auth/RequireAuth";
import AppLayout from "@/components/layout/AppLayout";

// Pagina de start rămâne în pachetul inițial; restul paginilor se încarcă la cerere (code splitting pe rute)
import HomePage from "@/pages/HomePage";
const FacilitiesPage = lazy(() => import("@/pages/FacilitiesPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const MyReservationsPage = lazy(() => import("@/pages/MyReservationsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

import "@/locales/i18n";

function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Se încarcă pagina…</span>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Pagina principală inovativă a USV */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                }
              />

              {/* Pagina de facilități sportive (conform Wireframe W2) */}
              <Route
                path="/facilitati"
                element={
                  <AppLayout>
                    <FacilitiesPage />
                  </AppLayout>
                }
              />
              <Route path="/facilities" element={<Navigate to="/facilitati" replace />} />

              {/* Rute de autentificare (doar pentru utilizatori neautentificați) */}
              <Route
                path="/login"
                element={
                  <RequireGuest>
                    <LoginPage />
                  </RequireGuest>
                }
              />
              <Route
                path="/inregistrare"
                element={
                  <RequireGuest>
                    <RegisterPage />
                  </RequireGuest>
                }
              />
              <Route
                path="/parola-uitata"
                element={
                  <RequireGuest>
                    <ForgotPasswordPage />
                  </RequireGuest>
                }
              />

              {/* Rute protejate pentru utilizatori autentificați */}
              <Route
                path="/rezerva"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <BookingPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/rezerva/:resourceId"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <BookingPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/rezervarile-mele"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <MyReservationsPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/profil"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </RequireAuth>
                }
              />

              {/* Rute protejate strict pentru Administrator */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </RequireAdmin>
                }
              />
              <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

              {/* Fallback pentru rute inexistente */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
