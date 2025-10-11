import { useState } from 'react';
import axios from 'axios';

interface DownloadFormProps {
  onDownloadStart: (downloadId: string) => void;
  disabled?: boolean;
}

export default function DownloadForm({ onDownloadStart, disabled = false }: DownloadFormProps) {
  const [url, setUrl] = useState('');

  const handleDownload = async () => {
    if (!url.trim()) {
      alert('Por favor ingresa una URL de Splice');
      return;
    }

    try {
      const { data } = await axios.post<{ downloadId: string; message: string }>('/download', { url });
      onDownloadStart(data.downloadId);
      setUrl('');
    } catch (error) {
      console.error('Error starting download:', error);
      alert('Error al iniciar la descarga');
    }
  };

  return (
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
          disabled={disabled}
        />
      </div>

      {/* Botón de descarga */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 cursor-pointer"
      >
        {disabled ? (
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
    </div>
  );
}
