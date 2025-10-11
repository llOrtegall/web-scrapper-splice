import { useState, useEffect } from 'react';
import axios from 'axios';

type DownloadStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface Download {
  status: DownloadStatus;
  filename?: string;
  error?: string;
}

export const useDownload = () => {
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [status, setStatus] = useState<Download | null>(null);
  const [loading, setLoading] = useState(false);

  // Polling para verificar el estado de la descarga
  useEffect(() => {
    if (!downloadId) return;

    setLoading(true);
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get<Download>(`/download/${downloadId}/status`);
        setStatus(data);

        // Si completó o falló, detener el polling
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        clearInterval(interval);
        setLoading(false);
      }
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, [downloadId]);

  const startDownload = async (url: string) => {
    if (!url.trim()) {
      throw new Error('Por favor ingresa una URL de Splice');
    }

    setLoading(true);
    setStatus(null);

    try {
      const { data } = await axios.post<{ downloadId: string; message: string }>('/download', { url });
      setDownloadId(data.downloadId);
      setStatus({ status: 'processing' });
      return data.downloadId;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const downloadFile = () => {
    if (!downloadId) return;

    // Descargar sin abrir ventana nueva
    const link = document.createElement('a');
    link.href = `/download/${downloadId}/file`;
    link.download = status?.filename || 'audio.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setDownloadId(null);
    setStatus(null);
    setLoading(false);
  };

  return {
    downloadId,
    status,
    loading,
    startDownload,
    downloadFile,
    reset
  };
};
