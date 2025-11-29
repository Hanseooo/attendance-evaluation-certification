// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, setRedirectTo } = useAuth();
  const location = useLocation();

  // If user is not authenticated, save the attempted path and redirect to landing/login.
  useEffect(() => {
    if (!isAuthenticated) {
      // store full path including querystring
      setRedirectTo(location.pathname + location.search);
    }
    // only run when auth state or location changes
  }, [isAuthenticated, location.pathname, location.search, setRedirectTo]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
