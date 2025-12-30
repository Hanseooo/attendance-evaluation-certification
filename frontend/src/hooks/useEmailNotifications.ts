import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/api/baseUrl";
import { useAuth } from "@/context/AuthContext";
import { useEmailNotificationStore } from "@/stores/emailNotificationStore";

const BASE_URL = API_BASE_URL;

export function useEmailNotifications() {
  const token = useAuth().token;

  const { enabled, hydrated, setEnabled, setHydrated } =
    useEmailNotificationStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- GET preference -------------------- */
  const fetchPreference = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/email-notifications/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok)
        throw new Error("Failed to fetch email notification preference");

      const data: { enabled: boolean } = await res.json();
      setEnabled(data.enabled);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setHydrated(true);
      setLoading(false);
    }
  }, [token, setEnabled, setHydrated]);

  /* -------------------- PATCH preference (optimistic) -------------------- */
  const toggle = useCallback(
    async (next: boolean) => {
      if (!token) return;

      // Optimistic UI
      setEnabled(next);

      try {
        const res = await fetch(`${BASE_URL}/api/users/email-notifications/`, {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled: next }),
        });

        if (!res.ok)
          throw new Error("Failed to update email notification preference");

        const data: { enabled: boolean } = await res.json();
        setEnabled(data.enabled);
        setError(null);
      } catch (err) {
        // ❗ Requirement #4: optimistic UI but surface error
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [token, setEnabled]
  );

  /* -------------------- Auto-fetch on mount -------------------- */
  useEffect(() => {
    if (!hydrated) fetchPreference();
  }, [fetchPreference, hydrated]);

  return {
    enabled,
    hydrated,
    loading,
    error,
    toggle,
    refetch: fetchPreference,
  };
}
