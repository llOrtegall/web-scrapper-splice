import { CloudDownload, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useDownload } from '@/hooks/useDownload';
import { DownloadStatusDisplay } from './DownloadStatusDisplay';
import { toast } from 'sonner';

function DownloaderSample() {
  const {
    url,
    setUrl,
    downloadId,
    status,
    loading,
    startDownload,
    downloadFile,
    reset
  } = useDownload();

  const handleDownload = async () => {
    try {
      await startDownload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar la descarga');
    }
  };

  const handleDownloadFile = async () => {
    try {
      await downloadFile();
      toast.success('Archivo descargado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al descargar el archivo');
    }
  };

  const isDownloadDisabled = loading || status?.status === 'processing' || status?.status === 'completed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Splice Downloader
          </CardTitle>
          <CardDescription className="text-base">
            Descarga samples de Splice fácilmente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">
              URL de Splice
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://splice.com/sounds/sample/..."
              disabled={loading}
            />
          </div>

          {/* Download Button */}
          <Button
            className="w-full sm:w-auto"
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CloudDownload className="mr-2 h-5 w-5" />
                Descargar Sample
              </>
            )}
          </Button>

          {/* Download Status */}
          <DownloadStatusDisplay
            status={status}
            downloadId={downloadId}
            onDownload={handleDownloadFile}
            onReset={reset}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default DownloaderSample;
