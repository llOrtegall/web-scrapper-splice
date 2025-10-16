import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postGenresRequest, postSearchRequest } from "../services/searchRequest";
import type { Data, Item } from "../types/searhResponse";
import type { Categories } from "@/types/genresResponse";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardSample } from "@/components/CardSample";

function SearchSpliceSample() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categories | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Fetch genres on component mount
    postGenresRequest()
      .then(res => {
        if (res && (res as Categories).categories) {
          setCategories((res as Categories));
        }
      })
      .catch(error => console.error("Error fetching genres:", error));
  }, [])

  const handleClick = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page on new search
    postSearchRequest(searchQuery, 1)
      .then(res => {
        if (res && (res as Data).assetsSearch) {
          setItems((res as Data).assetsSearch.items);
          setCurrentPage((res as Data).assetsSearch.pagination_metadata.currentPage);
          setTotalPages((res as Data).assetsSearch.pagination_metadata.totalPages);
        }
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setLoading(true);
    setCurrentPage(newPage);
    postSearchRequest(searchQuery, newPage)
      .then(res => {
        if (res && (res as Data).assetsSearch) {
          setItems((res as Data).assetsSearch.items);
          setTotalPages((res as Data).assetsSearch.pagination_metadata.totalPages);
          // Scroll to top after page change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  };

  const handlseSelectGenre = (genre: string) => {
    setItems([]);
    setLoading(true);
    postSearchRequest(searchQuery, 1, genre)
      .then(res => {
        if (res && (res as Data).assetsSearch) {
          setItems((res as Data).assetsSearch.items);
          setCurrentPage((res as Data).assetsSearch.pagination_metadata.currentPage);
          setTotalPages((res as Data).assetsSearch.pagination_metadata.totalPages);
        }
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }

  return (
    <section className="px-0 pt-8 flex flex-col">

      <section className="grid grid-cols-12">
        <CardContent className="px-12 col-span-10">
          <form onSubmit={handleClick} className="flex gap-2 py-4">
            <Label>
              Search Sample:
            </Label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="MVP... Rap... Guitar... Piano..."
              className="w-[26rem]"
            />

            <Button
              disabled={loading}
              type="submit"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          <ScrollArea className="h-[80vh] w-full">
            <CardContent>
              {error ? (
                <div className="text-red-500 p-4 bg-red-50 dark:bg-red-950 rounded-md">
                  Error: {error}
                </div>
              ) : items !== undefined && items.length > 0 ? (
                <CardSample items={items} />
              ) : (
                <div>No samples found. Try searching for something else.</div>
              )}
            </CardContent>
          </ScrollArea>
        </CardContent>

        <CardContent className="px-0 col-span-2">
          <CardHeader>
            <CardTitle className="text-yellow-400">Genres</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[85vh] w-full">
            <CardContent>
              {categories ? (
                <Accordion type="single" collapsible >
                  {
                    categories.categories.map(c => (
                      <AccordionItem key={c.uuid} value={c.uuid} >
                        <AccordionTrigger className="cursor-pointer hover:text-blue-300">{c.name}</AccordionTrigger>
                        <AccordionContent>
                          {c.description}
                          <ul className="flex flex-col gap-2">
                            {c.subcategories.map(sub => (
                              // <li key={sub.uuid}>{sub.name}</li>
                              <Badge
                                key={sub.uuid}
                                variant="default"
                                className="cursor-pointer hover:bg-blue-300"
                                onClick={() => handlseSelectGenre(sub.tags[0].uuid)} 
                              >
                                {sub.name}
                              </Badge>
                            ))}
                          </ul>


                        </AccordionContent>
                      </AccordionItem>
                    ))
                  }
                </Accordion>
              ) : (
                <p>No genres found.</p>
              )}
            </CardContent>
          </ScrollArea>
        </CardContent>
      </section>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {/* First page */}
          {currentPage > 3 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
                  1
                </PaginationLink>
              </PaginationItem>
              {currentPage > 4 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {/* Pages around current */}
          {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
            .filter(page => page > 0 && page <= totalPages)
            .map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

          {/* Last page */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {/* <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem> */}
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

    </section >
  );
}

export default SearchSpliceSample;