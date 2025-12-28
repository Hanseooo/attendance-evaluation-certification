// src/hooks/useCertificateTemplate.ts
import { useState, useCallback } from "react";
import { type CertificateTemplate, type CertificateTemplatePayload } from "@/utils/types";
import { API_BASE_URL } from "@/api/baseUrl";

const API_URL = API_BASE_URL;

export function useFetchCertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/certificate-templates/`);
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
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });


    const res = await fetch(`${API_URL}/api/certificate-templates/`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload certificate template");
    return await res.json();
  }, []);

  return { uploadTemplate };
}
