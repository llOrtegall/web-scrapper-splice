import { useAuth } from '../context/auth/AuthContext';
import { useDownload } from '../hooks/useDownload';
import DownloadForm from './DownloadForm';
import DownloadStatus from './DownloadStatus';
import AdminPanel from './AdminPanel';

function DownloaderSample() {
  const { user, logout } = useAuth();
  const { downloadId, status, loading, startDownload, downloadFile, reset } = useDownload();

  const handleDownloadStart = async (url: string) => {
    try {
      await startDownload(url);
    } catch (error) {
      alert('Error al iniciar la descarga');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
            🎵 Splice Downloader
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Descarga samples de Splice fácilmente</p>
        </div>

        <DownloadForm
          onDownloadStart={handleDownloadStart}
          disabled={loading || status?.status === 'processing' || status?.status === 'completed'}
        />

        <DownloadStatus
          downloadId={downloadId}
          onReset={reset}
          onDownloadFile={downloadFile}
        />

        {/* Información adicional */}
        {downloadId && (
          <div className="bg-slate-900/50 border border-slate-700 p-3 rounded-lg mt-4">
            <p className="text-xs text-slate-400 break-all">
              ID de descarga: <span className="font-mono text-slate-300">{downloadId}</span>
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={logout}
        className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer"
      >
        Cerrar sesión
      </button>

      {user?.rol === 'admin' && (
        <div className="absolute top-4 left-4">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}

export default DownloaderSample;
