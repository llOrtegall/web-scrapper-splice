import { CardContent } from "@/components/ui/card";
import { useSearch } from "@/hooks/useSearch";
import { useGenres } from "@/hooks/useGenres";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { GenresSidebar } from "@/components/GenresSidebar";
import { PaginationControls } from "@/components/PaginationControls";
import { useState, useCallback } from "react";
import type { FormEvent } from "react";

function SearchSpliceSample() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom hooks for data management
  const {
    items,
    loading,
    error,
    currentPage,
    totalPages,
    search,
    changePage
  } = useSearch();
  
  const { categories, loading: genresLoading } = useGenres();

  // Handlers with useCallback to prevent unnecessary re-renders
  const handleSearchSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    search(searchQuery, 1);
  }, [searchQuery, search]);

  const handleGenreSelect = useCallback((tagId: string) => {
    if (!tagId) return;
    search(searchQuery, 1, tagId);
  }, [searchQuery, search]);

  return (
    <section className="px-0 pt-8 flex flex-col">
      <section className="grid grid-cols-12 gap-4">
        {/* Main Content */}
        <CardContent className="px-2 2xl:px-12 col-span-10">
          <SearchForm
            searchQuery={searchQuery}
            loading={loading}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />
          <SearchResults
            items={items}
            loading={loading}
            error={error}
          />
        </CardContent>

        {/* Sidebar */}
        <GenresSidebar
          categories={categories}
          loading={genresLoading}
          onGenreSelect={handleGenreSelect}
        />
      </section>

      {/* Pagination */}
      {totalPages > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      )}
    </section>
  );
}

export default SearchSpliceSample;