import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    postSearchRequest(searchQuery)
      .then(res => {
        if (res && (res as Data).assetsSearch) {
          setItems((res as Data).assetsSearch.items);
        }
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  };

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
              {
                items !== undefined && items.length > 0
                  ? <CardSample items={items} />
                  : <div>No samples found. Try searching for something else.</div>
              }
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
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

    </section >
  );
}

export default SearchSpliceSample;