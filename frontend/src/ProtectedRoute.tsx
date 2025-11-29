import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { type ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, setRedirectTo } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the URL they were trying to access
    setRedirectTo(location.pathname + location.search);

    // Redirect to landing/login
    return <Navigate to="/" replace />;
  }

  return children;
}
