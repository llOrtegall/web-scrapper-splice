import { Download, PlayCircle, StopCircle, Music, Clock, Activity } from "lucide-react";
import type { Item } from "@/types/searhResponse";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { memo } from "react";
import {
  extractImageUrl,
  formatDuration,
  getFileName,
} from "@/utils/audioUtils";

interface CardSampleItemProps {
  sample: Item;
  isPlaying: boolean;
  isLoading: boolean;
  isDownloading: boolean;
  onPlay: () => void;
  onDownload: () => void;
}

/**
 * Componente individual de un sample de audio
 */
export const CardSampleItem = memo(({
  sample,
  isPlaying,
  isLoading,
  isDownloading,
  onPlay,
  onDownload,
}: CardSampleItemProps) => {
  const imageUrl = extractImageUrl(sample);
  const fileName = getFileName(sample);
  const packName = sample.parents?.items?.[0]?.name;

  return (
    <section className="group overflow-hidden transition-all border-b flex">
      {/* Image Thumbnail */}
      <div className="flex gap-4 p-4">
        <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden bg-muted rounded-md flex items-center justify-center">
          <img
            src={imageUrl}
            alt={fileName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid gap-4 grid-cols-12">
        {/* Action Buttons */}
        <div className="flex gap-2 items-center col-span-2">
          <Button
            onClick={onPlay}
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            className="w-16 2xl:w-24"
            disabled={isLoading}
            aria-label={isPlaying ? "Stop audio" : "Play audio"}
          >
            {isLoading ? (
              <>
                <Spinner />
                Loading...
              </>
            ) : isPlaying ? (
              <>
                <StopCircle className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Play
              </>
            )}
          </Button>

          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            title="Download sample as WAV"
            disabled={isDownloading}
            aria-label="Download audio"
          >
            {isDownloading ? (
              <Spinner />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Title */}
        <div className="flex flex-col justify-center col-span-6">
          <h3
            className="font-semibold text-base truncate group-hover:text-primary transition-colors"
            title={fileName}
          >
            {fileName}
          </h3>
          {packName && (
            <p className="text-sm text-muted-foreground truncate" title={packName}>
              {packName}
            </p>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="col-span-2 flex items-center gap-2">
          {sample.bpm && (
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              {sample.bpm} BPM
            </Badge>
          )}
          {sample.key && (
            <Badge variant="secondary" className="gap-1">
              <Music className="h-3 w-3" />
              {sample.key}
            </Badge>
          )}
          {sample.duration && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(sample.duration)}
            </Badge>
          )}
          {sample.asset_category_slug && (
            <Badge variant="outline" className="capitalize text-xs">
              {sample.asset_category_slug.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
      </div>
    </section>
  );
});

CardSampleItem.displayName = "CardSampleItem";
