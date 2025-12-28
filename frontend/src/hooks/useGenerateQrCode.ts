import { API_BASE_URL } from "@/api/baseUrl";
import { useAuth } from "@/context/AuthContext";

const BACKEND_BASE_URL = API_BASE_URL;

export interface QrData {
  qr_image: string;
  url: string;
  download_url?: string;
}

export interface QrResponse {
  seminar_id: number;
  check_in: QrData;
  check_out: QrData;
}

export function useGenerateQrCode() {
  const { token } = useAuth();

  const generateQrCodes = async (seminarId: number): Promise<QrResponse> => {
    if (!token) throw new Error("No auth token available. Please log in.");

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/generate-qr/${seminarId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("QR generation failed:", errorText);
      throw new Error("Failed to generate QR codes");
    }

    return response.json() as Promise<QrResponse>;
  };

  return generateQrCodes;
}
