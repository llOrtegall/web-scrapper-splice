import { AudioLines, Download, PlayCircle, StopCircle } from "lucide-react";
import type { Item } from "../types/searhResponse";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { decodeSpliceAudio } from "@/utils/decoder";

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
  )
}