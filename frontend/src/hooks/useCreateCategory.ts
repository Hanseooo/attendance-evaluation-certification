import { API_BASE_URL } from "@/api/baseUrl";
import { useAuth } from "@/context/AuthContext";
import { useCategoryStore } from "@/stores/categoryStore";
import type { Category } from "@/utils/types";
import { useState } from "react";

const BASE_URL = API_BASE_URL

export function useCreateCategory() {
  const { addCategory } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const authToken = useAuth().token;

  const createCategory = async (name: string) => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${BASE_URL}/api/seminars/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }

      const data: Category = await res.json();
      addCategory(data);
      setSuccess(true);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, createCategory };
}
