import { useState, useCallback } from "react";
import axios from "axios";

interface UseAudioDownloaderReturn {
  downloadingId: string | null;
  download: (id: string, audioUrl: string, fileName: string) => Promise<void>;
  isDownloading: (id: string) => boolean;
}

/**
 * Hook personalizado para manejar las descargas de audio
 */
export function useAudioDownloader(): UseAudioDownloaderReturn {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = useCallback(async (id: string, audioUrl: string, fileName: string) => {
    setDownloadingId(id);

    try {
      // Obtener el archivo WAV procesado desde la API
      const { data: wavBuffer } = await axios.get<ArrayBuffer>('/process', {
        responseType: 'arraybuffer',
        params: { url: audioUrl }
      });

      // Crear blob del archivo WAV
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const blobUrl = window.URL.createObjectURL(blob);

      // Crear elemento temporal para forzar descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw error;
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const isDownloading = useCallback((id: string) => downloadingId === id, [downloadingId]);

  return {
    downloadingId,
    download,
    isDownloading,
  };
}
