import { useEffect, useState, useRef } from "react";
import { useEvaluationApi } from "@/hooks/useEvaluationApi";
import type { EvaluationAnalytics } from "@/utils/types";

interface ApiResponse<T> {
  status: number;
  data: T;
}

const analyticsCache = new Map<number, EvaluationAnalytics>();

export function useSeminarAnalytics(seminarId: number | null) {
  const { getSeminarAnalytics } = useEvaluationApi();
  const getAnalyticsRef = useRef(getSeminarAnalytics); // keep stable ref
  const [data, setData] = useState<EvaluationAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!seminarId) return;

    // cached?
    const cached = analyticsCache.get(seminarId);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    getAnalyticsRef
      .current(seminarId)
      .then((res: ApiResponse<EvaluationAnalytics>) => {
        if (!mounted) return;
        if (res.status >= 200 && res.status < 300) {
          analyticsCache.set(seminarId, res.data);
          setData(res.data);
        } else {
          setError("Failed to load analytics");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? "Unknown error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [seminarId]); 

  return { data, loading, error };
}
