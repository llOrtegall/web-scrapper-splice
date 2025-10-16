import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Download, RotateCcw } from "lucide-react";
import type { Download as DownloadType } from "@/hooks/useDownload";
import { memo } from "react";

interface DownloadStatusDisplayProps {
  status: DownloadType | null;
  downloadId: string | null;
  onDownload: () => void;
  onReset: () => void;
}

export const DownloadStatusDisplay = memo(function DownloadStatusDisplay({
  status,
  downloadId,
  onDownload,
  onReset
}: DownloadStatusDisplayProps) {
  if (!status) return null;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className={
        status.status === 'processing' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' :
        status.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
        status.status === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
        ''
      }>
        <CardContent className="pt-6">
          {/* Processing State */}
          {status.status === 'processing' && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Procesando audio...
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Por favor espera mientras descargamos tu sample
                </p>
              </div>
            </div>
          )}

          {/* Completed State */}
          {status.status === 'completed' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    ¡Descarga completada!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 break-all">
                    Archivo: <Badge variant="outline" className="font-mono text-xs ml-1">
                      {status.filename}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={onDownload}
                  className="flex-1"
                  variant="default"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Archivo
                </Button>
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nueva descarga
                </Button>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status.status === 'failed' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Error en la descarga
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 break-words">
                    {status.error || 'Descarga falló'}
                  </p>
                </div>
              </div>

              <Button
                onClick={onReset}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download ID Info */}
      {downloadId && (
        <Card className="bg-muted">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground break-all">
              ID de descarga:{" "}
              <Badge variant="secondary" className="font-mono text-xs ml-1">
                {downloadId}
              </Badge>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
