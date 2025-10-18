import { useState, useRef, useEffect, useCallback } from "react";
import axios, { type CancelTokenSource } from "axios";
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
 * Hook personalizado para manejar la reproducción de audio con cancelación apropiada
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);

  /**
   * Limpia el audio actual y libera recursos
   */
  const cleanup = useCallback(() => {
    // Pausar y limpiar el audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.oncanplay = null;
      audioRef.current.onerror = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }

    // Revocar blob URL para liberar memoria
    if (blobUrlRef.current) {
      window.URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Cancelar request en progreso
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("New audio playback requested");
      cancelTokenRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setPlayingId(null);
    setLoadingId(null);
    currentRequestIdRef.current = null;
  }, [cleanup]);

  const play = useCallback(async (id: string, audioUrl: string) => {
    // Si ya está reproduciendo este audio, detenerlo
    if (playingId === id) {
      stop();
      return;
    }

    // Cancelar cualquier operación anterior inmediatamente
    cleanup();
    
    // Establecer el nuevo ID de carga
    setLoadingId(id);
    currentRequestIdRef.current = id;

    // Crear nuevo token de cancelación
    const cancelToken = axios.CancelToken.source();
    cancelTokenRef.current = cancelToken;

    try {
      // Obtener el buffer del audio desde la API con token de cancelación
      const { data: buffer } = await axios.get<ArrayBuffer>('/s3', {
        responseType: 'arraybuffer',
        params: { url: audioUrl },
        cancelToken: cancelToken.token
      });

      // Verificar si este request sigue siendo el actual
      if (currentRequestIdRef.current !== id) {
        return;
      }

      // Decodificar el audio de Splice
      const encodedData = new Uint8Array(buffer);
      const decodedData = decodeSpliceAudio(encodedData);

      // Verificar nuevamente por si cambió durante la decodificación
      if (currentRequestIdRef.current !== id) {
        return;
      }

      // Crear blob y URL temporal
      const blob = new Blob([decodedData], { type: "audio/mpeg" });
      const blobUrl = window.URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      // Crear y configurar el elemento de audio
      const audio = new Audio(blobUrl);
      audioRef.current = audio;

      audio.onended = () => {
        if (currentRequestIdRef.current === id) {
          setPlayingId(null);
          cleanup();
        }
      };
      
      audio.oncanplay = () => {
        if (currentRequestIdRef.current === id) {
          setLoadingId(null);
        }
      };
      
      audio.onerror = () => {
        if (currentRequestIdRef.current === id) {
          setLoadingId(null);
          setPlayingId(null);
          cleanup();
          console.error("Error al cargar el audio");
        }
      };

      // Verificar una vez más antes de reproducir
      if (currentRequestIdRef.current !== id) {
        cleanup();
        return;
      }

      setPlayingId(id);
      await audio.play();
    } catch (error) {
      // Solo actualizar estado si este request sigue siendo el actual
      if (currentRequestIdRef.current === id) {
        setLoadingId(null);
        setPlayingId(null);
        cleanup();
        
        // No loggear errores de cancelación
        if (!axios.isCancel(error)) {
          console.error("Error reproduciendo audio:", error);
          throw error;
        }
      }
    }
  }, [playingId, stop, cleanup]);

  const isPlaying = useCallback((id: string) => playingId === id, [playingId]);
  const isLoading = useCallback((id: string) => loadingId === id, [loadingId]);

  // Cleanup completo al desmontar el componente
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    playingId,
    loadingId,
    play,
    stop,
    isPlaying,
    isLoading,
  };
}
