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

export default function App() {
  const { isAuthenticated, loadingUser } = useAuth();

  // 🔄 Show a spinner while checking auth state
  if (loadingUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AuthModalProvider>
        {
          isAuthenticated && <Navbar />
        }
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />}
        />
        <Route path="/notFound" element={<NotFound />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all unknown routes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/notFound"} replace />}
        />
      </Routes>
    </AuthModalProvider>
  );
}
