import { useAuth } from "@/context/AuthContext";
import {
  type AttendanceAction,
  type RecordAttendanceResponse,
} from "@/utils/types";

// API base URL
const BASE_URL = "http://127.0.0.1:8000/api";

// Type for expected response
interface ApiResponse<T> {
  status: number;
  data: T;
}

// Hook return type
interface UseAttendanceApi {
  recordAttendance: (
    seminarId: number,
    action: AttendanceAction,
    qrToken: string
  ) => Promise<ApiResponse<RecordAttendanceResponse>>;
  generateQrImage: (seminarId: number, action: AttendanceAction) => string;
}

export function useAttendanceApi(): UseAttendanceApi {
  const { token } = useAuth();

  // Check for token availability before making the request
    const recordAttendance = async (
    seminarId: number,
    action: AttendanceAction,
    qrToken: string
    ): Promise<ApiResponse<RecordAttendanceResponse>> => {
    if (!token) {
        console.error("Authentication token is missing");
        throw new Error("Authentication token is missing");
    }

    const res = await fetch(`${BASE_URL}/attendance/${seminarId}/${action}/`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ qr_token: qrToken }),
    });

    const data = await res.json();
    return { status: res.status, data };
    };


  const generateQrImage = (
    seminarId: number,
    action: AttendanceAction
  ): string => {
    return `${BASE_URL}/generate-qr/${seminarId}/${action}/`;
  };

  return {
    recordAttendance,
    generateQrImage,
  };
}
