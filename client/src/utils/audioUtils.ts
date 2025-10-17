import type { Item } from "@/types/searhResponse";

/**
 * Extrae la URL de la imagen de portada de un sample
 */
export function extractImageUrl(sample: Item): string {
  const pack = sample.parents.items[0];
  const packCover = pack?.files.find(
    (x) => x.asset_file_type_slug === "cover_image"
  )?.url;
  return packCover || "img/missing-cover.png";
}

/**
 * Obtiene la URL del archivo de audio preview
 */
export function getAudioUrl(sample: Item): string | null {
  const audioFile = sample.files.find(
    (x) => x.asset_file_type_slug === "preview_mp3"
  );
  return audioFile?.url ?? null;
}

/**
 * Formatea la duración en milisegundos a formato MM:SS
 */
export function formatDuration(ms?: number): string {
  if (!ms || isNaN(ms)) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Obtiene el nombre del archivo sin la ruta
 */
export function getFileName(sample: Item): string {
  return sample.name.split("/").pop() || "sample";
}

/**
 * Genera el nombre del archivo para descarga
 */
export function getDownloadFileName(sample: Item, extension: string = "wav"): string {
  return getFileName(sample).replace(/\.[^/.]+$/, `.${extension}`);
}
