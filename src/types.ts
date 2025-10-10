/**
 * Metadata extracted from a sample page
 */
export interface SampleMetadata {
  title: string;
  artist: string;
  album: string;
  bpm: string | null;
  fileUrl: string;
  sampleId: string;
}

/**
 * Options for recording a sample
 */
export interface RecordingOptions {
  deviceName: string;
  audioInput: string;
}
