import { Download, PlayCircle, StopCircle, Music, Clock, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { decodeSpliceAudio } from "@/utils/decoder";
import type { Item } from "../types/searhResponse";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import axios from "axios";

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(sample => (
        <Card 
          key={sample.uuid} 
          className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
        >
          {/* Image Header */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img 
              src={extractImageUrl(sample)} 
              alt={sample.name} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Play/Stop Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={() => handlePlayClick(sample)}
                size="icon"
                className="h-16 w-16 rounded-full shadow-2xl"
                variant={playingId === sample.uuid ? "destructive" : "default"}
                disabled={audioLoading && playingId === sample.uuid}
              >
                {playingId === sample.uuid ? (
                  <StopCircle className="h-8 w-8" />
                ) : (
                  <PlayCircle className="h-8 w-8" />
                )}
              </Button>
            </div>

            {/* Loading Indicator */}
            {audioLoading && playingId === sample.uuid && (
              <div className="absolute top-2 right-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-1">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors" title={sample.name.split("/").pop()}>
                {sample.name.split("/").pop()}
              </h3>
              {sample.parents?.items?.[0]?.name && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {sample.parents.items[0].name}
                </p>
              )}
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2">
              {sample.bpm && (
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {sample.bpm} BPM
                </Badge>
              )}
              {sample.key && (
                <Badge variant="secondary" className="gap-1">
                  <Music className="h-3 w-3" />
                  {sample.key}
                </Badge>
              )}
              {sample.duration && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(sample.duration)}
                </Badge>
              )}
            </div>

            {/* Category */}
            {sample.asset_category_slug && (
              <div className="text-xs text-muted-foreground capitalize">
                {sample.asset_category_slug.replace(/_/g, ' ')}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handlePlayClick(sample)}
                variant={playingId === sample.uuid ? "destructive" : "default"}
                size="sm"
                className="flex-1"
                disabled={audioLoading && playingId === sample.uuid}
              >
                {playingId === sample.uuid ? (
                  <>
                    <StopCircle className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleDownload(sample)}
                variant="outline"
                size="sm"
                title="Download sample"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}