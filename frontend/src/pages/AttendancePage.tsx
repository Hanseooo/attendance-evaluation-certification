import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAttendanceApi } from "@/hooks/useAttendanceApi";
import { Loader2, CheckCircle } from "lucide-react";

export default function AttendancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("Processing Attendance");
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean | null>(null); // null = pending
  const { token: authToken } = useAuth();
  const { recordAttendance } = useAttendanceApi();
  const { setRedirectTo } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const action = query.get("action") as "check_in" | "check_out" | null;
    const seminarId = query.get("seminar");
    let qrToken = query.get("token");

    if (!authToken) {
      setRedirectTo(location.pathname + location.search);
      navigate("/", { replace: true });
      return;
    }

    if (!qrToken) {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set("token", authToken);
      navigate(
        { pathname: location.pathname, search: newSearchParams.toString() },
        { replace: true }
      );
      return;
    }

    if (!action || !seminarId || !qrToken) {
      setMessage("Invalid QR Code.");
      setSuccess(false);
      setLoading(false);
      return;
    }

    const submitAttendance = async () => {
      try {
        const response = await recordAttendance(
          parseInt(seminarId),
          action,
          qrToken || authToken
        );

        if (response.status === 200) {
          setMessage(response.data.success || "Attendance recorded.");
          setSuccess(true);

          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 5000);
        } else {
          setMessage(response.data.error || "Failed to record attendance.");
          setSuccess(false);
        }
      } catch (error) {
        setMessage("Network error. Please try again.");
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    submitAttendance();
  }, [authToken, location, navigate, recordAttendance]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 text-center transition-all duration-300">
        {loading && <Loader2 className="w-12 h-12 animate-spin text-primary" />}
        {!loading && success === true && (
          <CheckCircle className="w-12 h-12 text-green-500" />
        )}
        {!loading && success === false && (
          <CheckCircle className="w-12 h-12 text-primary" />
        )}

        <h2
          className={`text-lg font-semibold ${
            success === true
              ? "text-green-600"
              : success === false
                ? "text-primary"
                : "text-foreground"
          }`}
        >
          {message}
        </h2>

        {success && !loading && (
          <p className="text-sm text-muted-foreground">
            Redirecting to home in 5 seconds...
          </p>
        )}
      </div>
    </div>
  );
}
