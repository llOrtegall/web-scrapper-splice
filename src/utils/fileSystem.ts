import fs from "fs";
import { SampleMetadata } from "../types";

/**
 * Sanitizes a filename by removing invalid characters
 */
export function sanitizeFileName(fileName: string): string {
  // Remove file extension if present
  const nameWithoutExt = fileName.replace(/\.(wav|mp3|aiff|flac)$/i, '');
  
  // Replace invalid characters with underscores
  return nameWithoutExt
    .replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Initializes the output directory
 */
export function initializeOutputDirectory(outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Saves sample metadata to a JSON file
 */
export function saveMetadata(outputPath: string, metadata: SampleMetadata): void {
  fs.writeFileSync(`${outputPath}.json`, JSON.stringify(metadata, null, 2));
  console.log("✓ Metadata saved");
}
