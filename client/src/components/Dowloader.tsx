import { useAuth } from '../context/auth/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

type DownloadStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface Download {
  status: DownloadStatus;
  filename?: string;
  error?: string;
}

function DownloaderSample() {
  const [url, setUrl] = useState('');
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [status, setStatus] = useState<Download | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  console.log(user);

  // Polling optimizado para verificar el estado de la descarga
  useEffect(() => {
    if (!downloadId) return;

    let interval: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
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
        setStatus({ status: 'failed', error: 'Error verificando estado' });
        clearInterval(interval);
        setLoading(false);
      }
    };

    // Primera verificación inmediata
    checkStatus();
    
    // Polling cada 2 segundos para mejor UX
    interval = setInterval(checkStatus, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [downloadId]);

  const handleDownload = useCallback(async () => {
    if (!url.trim()) {
      alert('Por favor ingresa una URL de Splice');
      return;
    }

    setLoading(true);
    setStatus(null);
    setDownloadId(null);

    try {
      const { data } = await axios.post<{ downloadId: string; message: string }>(`/download`, { url });
      setDownloadId(data.downloadId);
      setStatus({ status: 'processing' });
    } catch (error) {
      console.error('Error starting download:', error);
      const errorMsg = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message
        : 'Error al iniciar la descarga';
      alert(errorMsg);
      setLoading(false);
    }
  }, [url]);

  const handleDownloadFile = useCallback(async () => {
    if (!downloadId) return;
    
    try {
      // Descargar como blob para evitar abrir nueva ventana
      const response = await axios.get(`/download/${downloadId}/file`, {
        responseType: 'blob'
      });
      
      // Crear URL temporal del blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = status?.filename || 'audio.mp3';
      
      // Agregar, click y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el URL temporal
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar el archivo');
    }
  }, [downloadId, status?.filename]);

  const handleReset = useCallback(() => {
    setUrl('');
    setDownloadId(null);
    setStatus(null);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
            🎵 Splice Downloader
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Descarga samples de Splice fácilmente</p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* Input URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
              URL de Splice
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://splice.com/sounds/sample/..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Botón de descarga */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || status?.status === 'processing' || status?.status === 'completed'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              '⬇️ Descargar Audio'
            )}
          </button>

          {/* Estado de la descarga */}
          {status && (
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
                        onClick={handleDownloadFile}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg hover:shadow-green-500/50 cursor-pointer"
                      >
                        📥 Descargar Archivo
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
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
                      onClick={handleReset}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer"
                    >
                      🔄 Intentar de nuevo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          {downloadId && (
            <div className="bg-slate-900/50 border border-slate-700 p-3 rounded-lg">
              <p className="text-xs text-slate-400 break-all">
                ID de descarga: <span className="font-mono text-slate-300">{downloadId}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer"
      >
        Cerrar sesión
      </button>

      {
        user?.rol === 'admin' && (
          <button
            className="absolute top-4 left-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        )
      }
    </div>
  );
}

export default DownloaderSample;