import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent } from "@/components/ui/card";
import { CardSample } from "@/components/CardSample";
import type { Item } from "@/types/searhResponse";
import { memo } from "react";

interface SearchResultsProps {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export const SearchResults = memo(function SearchResults({
  items,
  loading,
  error
}: SearchResultsProps) {
  return (
    <ScrollArea className="h-[80vh] w-full">
      <CardContent>
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-900">
            <h3 className="font-semibold mb-1">Error</h3>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="text-muted-foreground p-4 text-center">
            <div className="animate-pulse">Searching samples...</div>
          </div>
        ) : items.length > 0 ? (
          <CardSample items={items} />
        ) : (
          <div className="text-muted-foreground p-4 text-center">
            No samples found. Try searching for something else.
          </div>
        )}
      </CardContent>
    </ScrollArea>
  );
});
