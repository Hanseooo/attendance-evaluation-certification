import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/api/baseUrl";
import { useCategoryStore } from "@/stores/categoryStore";

const BASE_URL = API_BASE_URL;

export function useFetchCategories() {
  const { setCategories } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authToken = useAuth().token;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/seminars/categories/`, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch categories");

      const data: Category[] = await res.json();
      setCategories(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [authToken, setCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { loading, error, fetchCategories };
}
