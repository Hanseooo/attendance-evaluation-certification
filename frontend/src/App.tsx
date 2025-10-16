// src/App.tsx
import { useAuth } from "./context/AuthContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "./components/navbar/Navbar";
import EventsPage from "./pages/EventsPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const { isAuthenticated, loadingUser, user } = useAuth();

  if (loadingUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AuthModalProvider>
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? user?.role === "admin"
                ? <Navigate to="/admin" replace />
                : <Navigate to="/home" replace />
              : <LandingPage />
          }
        />

        {/* Participant routes */}
        {user?.role === "participant" && (
          <>
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
          </>
        )}

        {/* Admin routes */}
        {user?.role === "admin" && (
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        )}

        {/* Not Found route */}
        <Route path="/notFound" element={<NotFound />} />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </AuthModalProvider>
  );
}
