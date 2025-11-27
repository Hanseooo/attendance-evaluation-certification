// src/hooks/useAttendanceApi.ts
import { useAuth } from "@/context/AuthContext";
import {
  type AttendanceAction,
  type RecordAttendanceResponse,
  type Attendee,
} from "@/utils/types";

const BASE_URL =
  "https://attendance-evaluation-certification-production.up.railway.app/api";

interface ApiResponse<T> {
  status: number;
  data: T;
}

interface UseAttendanceApi {
  recordAttendance: (
    seminarId: number,
    action: AttendanceAction,
    qrToken: string
  ) => Promise<ApiResponse<RecordAttendanceResponse>>;
  generateQrImage: (seminarId: number, action: AttendanceAction) => string;
  getPresentUsers: (seminarId: number) => Promise<ApiResponse<Attendee[]>>;
}

export function useAttendanceApi(): UseAttendanceApi {
  const { token } = useAuth();

  const recordAttendance = async (
    seminarId: number,
    action: AttendanceAction,
    qrToken: string
  ): Promise<ApiResponse<RecordAttendanceResponse>> => {
    if (!token) throw new Error("Authentication token is missing");

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

  const getPresentUsers = async (seminarId: number): Promise<ApiResponse<Attendee[]>> => {
    if (!token) throw new Error("Missing authentication token");

    const res = await fetch(
      `${BASE_URL}/attendance/present-users/${seminarId}/`,
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    const data = await res.json();
    return { status: res.status, data };
  };

  return {
    recordAttendance,
    generateQrImage,
    getPresentUsers,
  };
}
