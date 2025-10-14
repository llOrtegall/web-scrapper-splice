import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postGenresRequest, postSearchRequest } from "../services/searchRequest";

import type { Data, Item } from "../types/searhResponse";
import type { Categories } from "@/types/genresResponse";
import { useState, useEffect } from "react";

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
    <Card className="grid grid-cols-12">

      <CardContent className="flex flex-col space-y-8 pt-8 col-span-10">
        <form onSubmit={handleClick} className="flex gap-2 ">
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
        <ScrollArea className="h-[80vh] w-full ">
          <CardContent className="mb-6">
            {
              items !== undefined && items.length > 0
                ? <CardSample items={items} />
                : <div>No samples found. Try searching for something else.</div>
            }
          </CardContent>
        </ScrollArea>
      </CardContent>

      <CardContent className="col-span-2 border-l bg-sidebar pl-4">
        <CardHeader>
          <CardTitle className="text-yellow-400">Genres</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[90vh]">
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

    </Card >
  );
}

export default SearchSpliceSample;