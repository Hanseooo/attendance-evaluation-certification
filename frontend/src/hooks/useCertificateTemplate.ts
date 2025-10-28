// src/hooks/useCertificateTemplate.ts
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  type CertificateTemplate,
  type CertificateTemplatePayload,
} from "@/utils/types";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export function useFetchCertificateTemplate() {
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchTemplate = useCallback(
    async (seminarId: number) => {
      if (!token) {
        setError("Authentication required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/certificate-templates/by_seminar/?seminar_id=${seminarId}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch template");
        }

        const data = await res.json();
        setTemplate(data);
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { template, loading, error, fetchTemplate };
}

export function useSaveCertificateTemplate() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const saveTemplate = useCallback(
    async (
      payload: CertificateTemplatePayload
    ): Promise<CertificateTemplate | null> => {
      if (!token) {
        setError("Authentication required");
        return null;
      }

      setSaving(true);
      setError(null);

      try {
        const formData = new FormData();

        // Add all fields to formData
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          }
        });

        const res = await fetch(`${API_URL}/certificate-templates/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to save template");
        }

        const data = await res.json();
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [token]
  );

  return { saveTemplate, saving, error };
}

export function useFetchDefaultConfig() {
  const [config, setConfig] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchDefaultConfig = useCallback(async () => {
    if (!token) return null;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/certificate-templates/default_config/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch default config");

      const data = await res.json();
      setConfig(data);
      return data;
    } catch (err) {
      console.error("Error fetching default config:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { config, loading, fetchDefaultConfig };
}
