import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export type DownloadStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface Download {
  status: DownloadStatus;
  filename?: string;
  error?: string;
}

interface UseDownloadReturn {
  url: string;
  setUrl: (url: string) => void;
  downloadId: string | null;
  status: Download | null;
  loading: boolean;
  startDownload: () => Promise<void>;
  downloadFile: () => Promise<void>;
  reset: () => void;
}

export function useDownload(): UseDownloadReturn {
  const [url, setUrl] = useState('');
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [status, setStatus] = useState<Download | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!downloadId) return;

    let interval: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const { data } = await axios.get<Download>(`/download/${downloadId}/status`);
        setStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setStatus({ status: 'failed', error: 'Error verificando estado' });
        clearInterval(interval);
        setLoading(false);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [downloadId]);

  const startDownload = useCallback(async () => {
    if (!url.trim()) {
      throw new Error('Por favor ingresa una URL de Splice');
    }

    setLoading(true);
    setStatus(null);
    setDownloadId(null);

    try {
      const { data } = await axios.post<{ downloadId: string; message: string }>(`/download`, { url });
      setDownloadId(data.downloadId);
      setStatus({ status: 'processing' });
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Error al iniciar la descarga';
      setLoading(false);
      throw new Error(errorMsg);
    }
  }, [url]);

  const downloadFile = useCallback(async () => {
    if (!downloadId) return;

    try {
      const response = await axios.get(`/download/${downloadId}/file`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = status?.filename || 'audio.mp3';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Error al descargar el archivo');
    }
  }, [downloadId, status?.filename]);

  const reset = useCallback(() => {
    setUrl('');
    setDownloadId(null);
    setStatus(null);
    setLoading(false);
  }, []);

  return {
    url,
    setUrl,
    downloadId,
    status,
    loading,
    startDownload,
    downloadFile,
    reset
  };
}
