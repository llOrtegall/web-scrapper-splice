import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { memo } from "react";
import type { FormEvent } from "react";

interface SearchFormProps {
  searchQuery: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const SearchForm = memo(function SearchForm({
  searchQuery,
  loading,
  onSearchChange,
  onSubmit
}: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 py-4">
      <Label htmlFor="search-input" className="flex items-center">
        Search Sample:
      </Label>
      <Input
        id="search-input"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="MVP... Rap... Guitar... Piano..."
        className="w-[26rem]"
        disabled={loading}
      />
      <Button disabled={loading} type="submit">
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
});
