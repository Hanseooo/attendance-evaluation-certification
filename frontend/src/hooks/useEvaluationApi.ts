// src/hooks/useEvaluationApi.ts
import { useAuth } from "@/context/AuthContext";
import { type Evaluation, type EvaluationPayload } from "@/utils/types";

const BASE_URL = "http://127.0.0.1:8000/api";

interface ApiResponse<T> {
  status: number;
  data: T;
}

interface UseEvaluationApi {
  getAvailableEvaluations: () => Promise<ApiResponse<Evaluation[]>>;
  submitEvaluation: (payload: EvaluationPayload) => Promise<ApiResponse<Evaluation>>;
}

export function useEvaluationApi(): UseEvaluationApi {
  const { token } = useAuth();

  const getAvailableEvaluations = async (): Promise<ApiResponse<Evaluation[]>> => {
    if (!token) throw new Error("Missing authentication token");
    const res = await fetch(`${BASE_URL}/evaluations/available-evaluations/`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  const submitEvaluation = async (
    payload: EvaluationPayload
  ): Promise<ApiResponse<Evaluation>> => {
    if (!token) throw new Error("Missing authentication token");
    const res = await fetch(`${BASE_URL}/evaluations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  return { getAvailableEvaluations, submitEvaluation };
}
