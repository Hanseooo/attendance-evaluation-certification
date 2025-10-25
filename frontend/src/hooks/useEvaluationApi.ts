import { useAuth } from "@/context/AuthContext";
import {
  type Evaluation,
  type EvaluationPayload,
  type SubmitEvaluationResponse,
} from "@/utils/types";

const BASE_URL = "http://127.0.0.1:8000/api";

interface ApiResponse<T> {
  status: number;
  data: T;
}

interface UseEvaluationApi {
  getAvailableEvaluations: () => Promise<ApiResponse<Evaluation[]>>;
  submitEvaluation: (
    payload: EvaluationPayload
  ) => Promise<ApiResponse<Evaluation>>;
  submitEvaluationWithCertificate: (
    payload: EvaluationPayload
  ) => Promise<SubmitEvaluationResponse>;
}

export function useEvaluationApi(): UseEvaluationApi {
  const { token } = useAuth();

  // ✅ Fetch all pending evaluations
  const getAvailableEvaluations = async (): Promise<
    ApiResponse<Evaluation[]>
  > => {
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

    // Map to backend field names
    const body = {
      seminar_id: payload.seminar_id,
      content_and_relevance: payload.content_and_relevance,
      presenters_effectiveness: payload.presenters_effectiveness,
      organization_and_structure: payload.organization_and_structure,
      materials_usefulness: payload.materials_usefulness,
      overall_satisfaction: payload.overall_satisfaction,
      suggestions: payload.suggestions,
    };

    const res = await fetch(`${BASE_URL}/evaluations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return { status: res.status, data };
  };


  const submitEvaluationWithCertificate = async (
    payload: EvaluationPayload
  ): Promise<SubmitEvaluationResponse> => {
    if (!token) throw new Error("Missing authentication token");

    const res = await fetch(`${BASE_URL}/evaluations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // Your backend should return { success: "...", certificate_url: "https://..." }
    const data = await res.json();
    return data as SubmitEvaluationResponse;
  };

  return {
    getAvailableEvaluations,
    submitEvaluation,
    submitEvaluationWithCertificate,
  };
}
