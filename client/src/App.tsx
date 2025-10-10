import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

type DownloadStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface Download {
  status: DownloadStatus;
  filename?: string;
  error?: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [status, setStatus] = useState<Download | null>(null);
  const [loading, setLoading] = useState(false);

  // Polling para verificar el estado de la descarga
  useEffect(() => {
    if (!downloadId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get<Download>(`${API_URL}/download/${downloadId}/status`);
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
    }, 3000); // Verificar cada 3 segundos

    return () => clearInterval(interval);
  }, [downloadId]);

  const handleDownload = async () => {
    if (!url.trim()) {
      alert('Por favor ingresa una URL de Splice');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { data } = await axios.post<{ downloadId: string; message: string }>(
        `${API_URL}/download`,
        { url }
      );
      
      setDownloadId(data.downloadId);
      setStatus({ status: 'processing' });
    } catch (error) {
      console.error('Error starting download:', error);
      alert('Error al iniciar la descarga');
      setLoading(false);
    }
  };

  const handleDownloadFile = () => {
    if (!downloadId) return;
    // Descargar sin abrir ventana nueva
    const link = document.createElement('a');
    link.href = `${API_URL}/download/${downloadId}/file`;
    link.download = status?.filename || 'audio.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setUrl('');
    setDownloadId(null);
    setStatus(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
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
            <div className={`p-4 sm:p-5 rounded-lg border-2 backdrop-blur-sm ${
              status.status === 'processing' ? 'bg-blue-500/10 border-blue-500/50' :
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
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg hover:shadow-green-500/50"
                      >
                        📥 Descargar Archivo
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition"
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
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition"
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
    </div>
  );
}

export default App;
