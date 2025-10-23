// src/hooks/useCertificateTemplate.ts
import { useState, useCallback } from "react";
import { type CertificateTemplate, type CertificateTemplatePayload } from "@/utils/types";

const API_URL = import.meta.env.VITE_API_URL;

export function useFetchCertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/certificate-templates/`);
    const data = await res.json();
    setTemplates(data);
    setLoading(false);
  }, []);

  return { templates, loading, fetchTemplates };
}

export function useUploadCertificateTemplate() {
  const uploadTemplate = useCallback(async (payload: CertificateTemplatePayload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value as string | Blob);
    });

    const res = await fetch(`${API_URL}/certificate-templates/`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload certificate template");
    return await res.json();
  }, []);

  return { uploadTemplate };
}
