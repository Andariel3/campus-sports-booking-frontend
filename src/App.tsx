import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/AuthContext";
import { RequireAuth, RequireAdmin, RequireGuest } from "@/features/auth/RequireAuth";
import AppLayout from "@/components/layout/AppLayout";

import HomePage from "@/pages/HomePage";
import FacilitiesPage from "@/pages/FacilitiesPage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import BookingPage from "@/pages/BookingPage";
import MyReservationsPage from "@/pages/MyReservationsPage";
import ProfilePage from "@/pages/ProfilePage";

import "@/locales/i18n";

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
            <Route
              path="/dashboard"
              element={<Navigate to="/admin" replace />}
            />

            {/* Fallback pentru rute inexistente */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
