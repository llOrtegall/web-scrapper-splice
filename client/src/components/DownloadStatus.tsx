import { useState, useEffect } from 'react';
import axios from 'axios';

type DownloadStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface Download {
  status: DownloadStatus;
  filename?: string;
  error?: string;
}

interface DownloadStatusProps {
  downloadId: string | null;
  onReset: () => void;
  onDownloadFile: () => void;
}

export default function DownloadStatusDisplay({ downloadId, onReset, onDownloadFile }: DownloadStatusProps) {
  const [status, setStatus] = useState<Download | null>(null);

  // Polling para verificar el estado de la descarga
  useEffect(() => {
    if (!downloadId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get<Download>(`/download/${downloadId}/status`);
        setStatus(data);

        // Si completó o falló, detener el polling
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        clearInterval(interval);
      }
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, [downloadId]);

  if (!status) return null;

  return (
    <div className={`p-4 sm:p-5 rounded-lg border-2 backdrop-blur-sm ${status.status === 'processing' ? 'bg-blue-500/10 border-blue-500/50' :
      status.status === 'completed' ? 'bg-green-500/10 border-green-500/50' :
        status.status === 'failed' ? 'bg-red-500/10 border-red-500/50' :
          'bg-slate-700/30 border-slate-600'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {status.status === 'processing' && (
          <div className="flex items-center gap-2 text-blue-400">
            <svg className="animate-spin h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium text-sm sm:text-base">Procesando audio...</span>
          </div>
        )}

        {status.status === 'completed' && (
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-sm sm:text-base">¡Descarga completada!</span>
            </div>
            <p className="text-sm text-slate-300 mb-3 break-all">
              Archivo: <span className="font-mono font-semibold text-green-400">{status.filename}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onDownloadFile}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg hover:shadow-green-500/50 cursor-pointer"
              >
                📥 Descargar Archivo
              </button>
              <button
                type="button"
                onClick={onReset}
                className="sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer"
              >
                🔄 Nueva descarga
              </button>
            </div>
          </div>
        )}

        {status.status === 'failed' && (
          <div className="flex-1 w-full">
            <div className="flex items-start gap-2 text-red-400 mb-3">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm sm:text-base break-words">
                <span className="font-medium">Error:</span> {status.error || 'Descarga falló'}
              </div>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer"
            >
              🔄 Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
