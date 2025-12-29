import { API_BASE_URL } from "@/api/baseUrl";
import { useAuth } from "@/context/AuthContext";
import { useCategoryStore } from "@/stores/categoryStore";
import { useState } from "react";

const BASE_URL = API_BASE_URL

export function useDeleteCategory() {
  const { removeCategory } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const authToken = useAuth().token;

  const deleteCategory = async (id: number) => {
    if (!id) {
      setError("No category selected");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${BASE_URL}/api/seminars/categories/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete category");
      }

      removeCategory(id);
      setSuccess(true);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, deleteCategory };
}
