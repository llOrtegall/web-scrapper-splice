import { getAudioUrl, getDownloadFileName } from "@/utils/audioUtils";
import { useAudioDownloader } from "@/hooks/useAudioDownloader";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { Item } from "../types/searhResponse";
import { CardSampleItem } from "./CardSampleItem";
import { useCallback } from "react";

interface CardSampleProps {
  items: Item[];
}

/**
 * Componente contenedor que renderiza una lista de samples de audio
 */
export function CardSample({ items }: CardSampleProps) {
  const audioPlayer = useAudioPlayer();
  const audioDownloader = useAudioDownloader();

  const handlePlay = useCallback(
    (sample: Item) => {
      const audioUrl = getAudioUrl(sample);
      if (!audioUrl) {
        console.warn("No audio URL found for sample:", sample.uuid);
        return;
      }
      audioPlayer.play(sample.uuid, audioUrl);
    },
    [audioPlayer]
  );

  const handleDownload = useCallback(
    (sample: Item) => {
      const audioUrl = getAudioUrl(sample);
      if (!audioUrl) {
        console.warn("No audio URL found for sample:", sample.uuid);
        return;
      }
      const fileName = getDownloadFileName(sample);
      audioDownloader.download(sample.uuid, audioUrl, fileName);
    },
    [audioDownloader]
  );

  return (
    <>
      {items.map((sample) => (
        <CardSampleItem
          key={sample.uuid}
          sample={sample}
          isPlaying={audioPlayer.isPlaying(sample.uuid)}
          isLoading={audioPlayer.isLoading(sample.uuid)}
          isDownloading={audioDownloader.isDownloading(sample.uuid)}
          onPlay={() => handlePlay(sample)}
          onDownload={() => handleDownload(sample)}
        />
      ))}
    </>
  );
}