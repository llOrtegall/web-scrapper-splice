import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { decodeSpliceAudio } from "@/utils/decoder";

interface UseAudioPlayerReturn {
  playingId: string | null;
  loadingId: string | null;
  play: (id: string, audioUrl: string) => Promise<void>;
  stop: () => void;
  isPlaying: (id: string) => boolean;
  isLoading: (id: string) => boolean;
}

/**
 * Hook personalizado para manejar la reproducción de audio
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    setPlayingId(null);
    setLoadingId(null);
  }, []);

  const play = useCallback(async (id: string, audioUrl: string) => {
    // Si ya está reproduciendo este audio, detenerlo
    if (playingId === id) {
      stop();
      return;
    }

    setLoadingId(id);

    try {
      // Detener cualquier audio anterior
      stop();

      // Obtener el buffer del audio desde la API
      const { data: buffer } = await axios.get<ArrayBuffer>('/s3', {
        responseType: 'arraybuffer',
        params: { url: audioUrl }
      });

      // Decodificar el audio de Splice
      const encodedData = new Uint8Array(buffer);
      const decodedData = decodeSpliceAudio(encodedData);

      // Crear blob y URL temporal
      const blob = new Blob([decodedData], { type: "audio/mpeg" });
      const blobUrl = window.URL.createObjectURL(blob);

      // Crear y configurar el elemento de audio
      const audio = new Audio(blobUrl);
      audioRef.current = audio;

      audio.onended = () => setPlayingId(null);
      audio.oncanplay = () => setLoadingId(null);
      audio.onerror = () => {
        setLoadingId(null);
        setPlayingId(null);
        console.error("Error al cargar el audio");
      };

      setPlayingId(id);
      await audio.play();
    } catch (error) {
      setLoadingId(null);
      setPlayingId(null);
      console.error("Error reproduciendo audio:", error);
      throw error;
    }
  }, [playingId, stop]);

  const isPlaying = useCallback((id: string) => playingId === id, [playingId]);
  const isLoading = useCallback((id: string) => loadingId === id, [loadingId]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return {
    playingId,
    loadingId,
    play,
    stop,
    isPlaying,
    isLoading,
  };
}
