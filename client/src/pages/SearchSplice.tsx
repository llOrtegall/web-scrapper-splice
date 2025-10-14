import type { Categories } from "@/types/genresResponse";
import { AudioLines, Download, PlayCircle, StopCircle } from "lucide-react";
import { postGenresRequest, postSearchRequest } from "../services/searchRequest";
import type { Data, Item } from "../types/searhResponse";
import { useState, useRef, useEffect } from "react";
import { decodeSpliceAudio } from "../utils/decoder";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

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

function SearchSpliceSample() {
  // Formatea duración en ms a mm:ss
  function formatDuration(ms?: number): string {
    if (!ms || isNaN(ms)) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {

    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

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

  function extractImageUrl(sample: Item): string {
    const pack = sample.parents.items[0];
    const packCover = pack
      ? pack.files.find((x) => x.asset_file_type_slug == "cover_image")?.url
      : "img/missing-cover.png";
    return packCover || "img/missing-cover.png";
  }

  function getAudio(sample: Item): string | null {
    const audioFile = sample.files.find(
      (x) => x.asset_file_type_slug == "preview_mp3"
    );
    return audioFile ? audioFile.url : null;
  }

  async function handlePlayClick(sample: Item) {
    const audioUrl = getAudio(sample);

    if (!audioUrl) return;

    // Si ya está reproduciendo este sample, detenerlo
    if (playingId === sample.uuid) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      }
      setPlayingId(null);
      setAudioLoading(false);
      return;
    }

    setAudioLoading(true);
    try {
      // Detener cualquier audio anterior
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      // Pedir el buffer binario usando la API personalizada
      const { data: buffer } = await axios.get('/s3', { responseType: 'arraybuffer', params: { url: audioUrl } })

      // Decodificar el audio de Splice
      const encodedData = new Uint8Array(buffer);
      const decodedData = decodeSpliceAudio(encodedData);

      // Crear un blob y una URL temporal para reproducir
      const blob = new Blob([decodedData], { type: "audio/mpeg" });
      const blobUrl = window.URL.createObjectURL(blob);

      const audio = new window.Audio(blobUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingId(null);
      audio.oncanplay = () => setAudioLoading(false);
      audio.onerror = () => {
        setAudioLoading(false);
        setPlayingId(null);
      };
      setPlayingId(sample.uuid);
      await audio.play();
    } catch (error) {
      setAudioLoading(false);
      setPlayingId(null);
      console.error("Error reproduciendo audio:", error);
    }
  }

  async function handleDownload(sample: Item) {
    const audioUrl = getAudio(sample);
    if (!audioUrl) return;

    try {
      // Fetch del audio usando la API personalizada
      const { data: buffer } = await axios.get<ArrayBuffer>('/s3', { responseType: 'arraybuffer', params: { url: audioUrl } })

      // Decodificar el audio de Splice
      const encodedData = new Uint8Array(buffer);
      const decodedData = decodeSpliceAudio(encodedData);

      // Crear blob del audio decodificado
      const blob = new Blob([decodedData], { type: "audio/mpeg" });
      const blobUrl = window.URL.createObjectURL(blob);

      // Crear elemento <a> temporal para forzar descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = sample.name.split("/").pop() || 'sample.mp3';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  }

  return (
    <Card className="px-12 py-6 my-6">

      <CardContent className="mb-6">
        <form onSubmit={handleClick} className="flex gap-2">
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
      </CardContent>

      <CardContent className="mb-6">
        {categories ? (
          <Accordion type="single" collapsible>
            {
              categories.categories.map(c => (
                <AccordionItem key={c.uuid} value={c.uuid}>
                  <AccordionTrigger>{c.name}</AccordionTrigger>
                  <AccordionContent>
                    {c.description}
                    <ul className="flex flex-wrap gap-2 mt-2">
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
          <p>No categories found.</p>
        )}
      </CardContent>

      <CardContent className="mb-6">



        {items.length > 0 ? (
          <>
            <ul className="space-y-2 ">
              <ul className="grid p-3 rounded bg-gray-800 border border-gray-700 grid-cols-1 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2 md:gap-4 items-center font-bold text-gray-400 mb-1 text-ce">
                <li className="col-span-2">audio</li>
                <li className="col-span-4">name</li>
                <li className="col-span-2">progress</li>
                <li className="col-span-2">time</li>
                <li className="col-span-2">key</li>
              </ul>
              {items.map(sample => (
                <li key={sample.uuid} className="grid p-3 rounded bg-gray-800 border border-gray-700 grid-cols-1 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2 md:gap-4 items-center">

                  <figure className="flex items-center justify-around gap-2 col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2">
                    <img src={extractImageUrl(sample)} alt={sample.name} className="rounded-sm" width={68} height={68} loading="lazy" />

                    <button className="p-1 rounded bg-gray-700">
                      <AudioLines className="w-8 h-8 text-blue-200" />
                    </button>

                    <button
                      onClick={() => handlePlayClick(sample)}
                      className={`p-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer flex items-center justify-center relative`}
                      disabled={audioLoading && playingId === sample.uuid}
                      title={playingId === sample.uuid ? "Stop" : "Play"}
                    >
                      {playingId === sample.uuid ? (
                        <StopCircle className="w-8 h-8 text-red-400" />
                      ) : (
                        <PlayCircle className="w-8 h-8 text-yellow-300" />
                      )}
                      {audioLoading && playingId === sample.uuid && (
                        <span className="absolute right-0 top-0 text-xs text-blue-300 animate-pulse">Loading...</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload(sample)}
                      className="p-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer"
                      title="Download sample"
                    >
                      <Download className="w-8 h-8 text-green-300" />
                    </button>

                  </figure>

                  <section className="flex flex-col justify-center col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4">
                    <div
                      className="font-bold text-blue-300 truncate max-w-[180px] md:max-w-[320px] lg:max-w-[480px]"
                      title={sample.name.split("/").pop()}
                    >
                      {sample.name.split("/").pop()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>BPM: {sample.bpm ?? "---"}</span>
                      <span className="ml-4">Type: {sample.asset_category_slug ?? "-"}</span>
                    </div>
                  </section>

                  <div className="flex items-center col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2">
                    <canvas
                      width={250}
                      height={30}
                      className="bg-gray-700 rounded shadow-inner border border-gray-600"
                      style={{
                        display: "block",
                        boxSizing: "border-box",
                        outline: "none",
                        transition: "box-shadow 0.2s",
                      }}
                    ></canvas>
                  </div>

                  <section className="flex flex-col justify-center ml-auto text-right col-span-1">
                    <div>Time: {formatDuration(sample.duration)}</div>
                  </section>

                  <section className="flex flex-col justify-center ml-auto text-right col-span-1">
                    <div>Key: {sample.key ?? "-"}</div>
                  </section>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-gray-400">No results yet.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default SearchSpliceSample;