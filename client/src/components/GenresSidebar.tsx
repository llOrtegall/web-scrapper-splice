import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Categories } from "@/types/genresResponse";
import { memo } from "react";

interface GenresSidebarProps {
  categories: Categories | null;
  loading: boolean;
  onGenreSelect: (tagId: string) => void;
}

export const GenresSidebar = memo(function GenresSidebar({
  categories,
  loading,
  onGenreSelect
}: GenresSidebarProps) {
  if (loading) {
    return (
      <CardContent className="px-0 col-span-2">
        <CardHeader>
          <CardTitle className="text-yellow-400">Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading genres...</p>
        </CardContent>
      </CardContent>
    );
  }

  return (
    <CardContent className="px-0 col-span-2">
      <CardHeader>
        <CardTitle className="text-yellow-400">Genres</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[85vh] w-full">
        <CardContent>
          {categories ? (
            <Accordion type="single" collapsible>
              {categories.categories.map(category => (
                <AccordionItem key={category.uuid} value={category.uuid}>
                  <AccordionTrigger className="cursor-pointer hover:text-blue-300 text-sm">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {category.subcategories.map(subcategory => (
                        <Badge
                          key={subcategory.uuid}
                          variant="default"
                          className="cursor-pointer hover:bg-blue-300 transition-colors"
                          onClick={() => onGenreSelect(subcategory.tags[0]?.uuid)}
                        >
                          {subcategory.name}
                        </Badge>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">No genres available.</p>
          )}
        </CardContent>
      </ScrollArea>
    </CardContent>
  );
});
