import { useAuth } from "./context/AuthContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import EventsPage from "./pages/EventsPage";
import AdminPage from "./pages/AdminPage";
import LoadingPage from "./pages/LoadingPage";
import AttendancePage from "./pages/AttendancePage";
import FeedbackPage from "./pages/FeedbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";


export default function App() {
  const { isAuthenticated, loadingUser, user, redirectTo } = useAuth();

  if (loadingUser) {
    return (
      <LoadingPage />
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
            isAuthenticated ? (
              redirectTo ? (
                <Navigate to={redirectTo} replace />
              ) : user?.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <LandingPage />
            )
          }
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
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
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackPage />
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
