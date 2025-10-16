import { useState, useCallback } from "react";
import { postSearchRequest } from "@/services/searchRequest";
import type { Data, Item } from "@/types/searhResponse";

interface UseSearchReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  search: (query: string, page?: number, tagId?: string) => Promise<void>;
  changePage: (page: number) => void;
  resetSearch: () => void;
}

export function useSearch(): UseSearchReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastQuery, setLastQuery] = useState("");
  const [lastTagId, setLastTagId] = useState<string | undefined>();

  const search = useCallback(async (query: string, page = 1, tagId?: string) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    setLastTagId(tagId);

    try {
      const res = await postSearchRequest(query, page, tagId);

      if (res && (res as Data).assetsSearch) {
        const data = (res as Data).assetsSearch;
        setItems(data.items);
        setCurrentPage(data.pagination_metadata.currentPage);
        setTotalPages(data.pagination_metadata.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const changePage = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    search(lastQuery, page, lastTagId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages, currentPage, lastQuery, lastTagId, search]);

  const resetSearch = useCallback(() => {
    setItems([]);
    setError(null);
    setCurrentPage(1);
    setTotalPages(0);
    setLastQuery("");
    setLastTagId(undefined);
  }, []);

  return {
    items,
    loading,
    error,
    currentPage,
    totalPages,
    search,
    changePage,
    resetSearch
  };
}
