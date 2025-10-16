import { useState, useEffect } from "react";
import { postGenresRequest } from "@/services/searchRequest";
import type { Categories } from "@/types/genresResponse";

interface UseGenresReturn {
  categories: Categories | null;
  loading: boolean;
  error: string | null;
}

export function useGenres(): UseGenresReturn {
  const [categories, setCategories] = useState<Categories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await postGenresRequest();
        if (res && (res as Categories).categories) {
          setCategories(res as Categories);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load genres");
        console.error("Error fetching genres:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return { categories, loading, error };
}
