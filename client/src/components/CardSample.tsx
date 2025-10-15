import { AudioLines, Download, PlayCircle, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { decodeSpliceAudio } from "@/utils/decoder";
import type { Item } from "../types/searhResponse";
import axios from "axios";
import { Card, CardContent } from "./ui/card";

export function CardSample({ items }: { items: Item[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  function formatDuration(ms?: number): string {
    if (!ms || isNaN(ms)) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

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
    <ul className="space-y-2">
      {items.map(sample => (
        <Card key={sample.uuid}>

          <CardContent className="flex items-center gap-2">
            <figure>
              <img src={extractImageUrl(sample)} alt={sample.name} className="rounded-sm" width={68} height={68} loading="lazy" />
            </figure>

            <button
              onClick={() => handlePlayClick(sample)}
              className={`bg-gray-800 p-2 rounded-md hover:bg-gray-700 cursor-pointer flex items-center justify-center relative`}
              disabled={audioLoading && playingId === sample.uuid}
              title={playingId === sample.uuid ? "Stop" : "Play"}
            >
              {playingId === sample.uuid ? (
                <StopCircle className="text-red-500" />
              ) : (
                <PlayCircle className="text-green-600" />
              )}
              {audioLoading && playingId === sample.uuid && (
                <span className="absolute right-0 top-0 text-xs text-blue-300 animate-pulse">Loading...</span>
              )}
            </button>

            <button
              onClick={() => handleDownload(sample)}
              className="bg-gray-800 p-2 rounded-md hover:bg-gray-700 cursor-pointer flex items-center"
              title="Download sample"
            >
              <Download className="text-gray-300" />
            </button>

          </CardContent>

          <CardContent className="flex items-center gap-2">
            <div title={sample.name.split("/").pop()} >
              {sample.name.split("/").pop()}
            </div>
            <div>
              <span>BPM: {sample.bpm ?? "---"}</span>
              <span>Type: {sample.asset_category_slug ?? "-"}</span>
            </div>
            <div>Time: {formatDuration(sample.duration)}</div>
          </CardContent>
        </Card>
      ))}
    </ul>
  )
}