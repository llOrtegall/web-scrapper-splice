import { spawn } from "child_process";
import path from "path";

export interface WaitForSilenceOptions {
  deviceName: string;
  audioInput?: string;
  silenceThreshold?: number;
  silenceDuration?: number;
  timeout?: number;
  onTimeout?: () => void;
}

const DEFAULT_SILENCE_THRESHOLD = -30; // dB
const DEFAULT_SILENCE_DURATION = 0.1; // seconds
const DEFAULT_TIMEOUT = 1000; // milliseconds

/**
 * Waits for audio silence on the specified recording device (Linux PulseAudio)
 * @param options Configuration options for silence detection
 * @returns Promise that resolves when silence is detected or timeout occurs
 */
export async function waitForSilence(options: WaitForSilenceOptions): Promise<void> {
  const {
    deviceName,
    audioInput = "pulse",
    silenceThreshold = DEFAULT_SILENCE_THRESHOLD,
    silenceDuration = DEFAULT_SILENCE_DURATION,
    timeout = DEFAULT_TIMEOUT,
    onTimeout = () => { },
  } = options;

  return new Promise<void>((resolve, reject) => {
    console.log(`Waiting for silence on device: ${deviceName}...`);

    const timeoutId = setTimeout(() => {
      console.log("Silence detection timed out");
      onTimeout();
      resolve();
    }, timeout);

    const args = [
      "-f",
      audioInput,
      "-i",
      deviceName,
      "-af",
      `silencedetect=n=${silenceThreshold}dB:d=${silenceDuration}`,
      "-f",
      "null",
      "-",
    ];

    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stderr.on("data", (data: Buffer) => {
      const output = data.toString();

      if (output.includes("silence_start")) {
        console.log("Silence detected!");
        clearTimeout(timeoutId);
        ffmpeg.kill();
        resolve();
      }
    });

    ffmpeg.on("error", (err: Error) => {
      clearTimeout(timeoutId);
      reject(new Error(`FFmpeg error during silence detection: ${err.message}`));
    });

    ffmpeg.on("exit", (code: number | null) => {
      if (code !== null && code !== 0 && code !== 255) {
        console.warn(`FFmpeg silence detection exited with code ${code}`);
      }
    });
  });
}

/**
 * Gets the duration of an audio file in milliseconds using ffprobe
 * @param filePath Path to the audio file
 * @returns Promise that resolves with the duration in milliseconds
 */
export async function getAudioLengthInMillis(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";

    ffprobe.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    ffprobe.stderr.on("data", (data: Buffer) => {
      console.error(`ffprobe error: ${data.toString()}`);
    });

    ffprobe.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited with code ${code}`));
      } else {
        const seconds = parseFloat(output.trim());
        const millis = Math.round(seconds * 1000);
        resolve(millis);
      }
    });
  });
}

const SILENCE_DETECTION_THRESHOLD = -50; // dB
const SILENCE_DETECTION_DURATION = 1; // seconds

/**
 * Checks if an entire audio file contains only silence
 * @param filePath Path to the audio file to check
 * @returns Promise that resolves to true if the file is entirely silent, false otherwise
 */
export async function isEntireAudioSilent(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      path.resolve(filePath),
      "-af",
      `silencedetect=n=${SILENCE_DETECTION_THRESHOLD}dB:d=${SILENCE_DETECTION_DURATION}`,
      "-f",
      "null",
      "-",
    ]);

    let output = "";

    ffmpeg.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    ffmpeg.stderr.on("data", (data: Buffer) => {
      output += data.toString();
    });

    ffmpeg.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg exited with code ${code}`));
      } else {
        const hasSilenceStart = /silence_start/.test(output);
        const hasSilenceEnd = /silence_end/.test(output);

        // If silence starts but never ends, the entire file is silent
        const isCompleteSilence = hasSilenceStart && !hasSilenceEnd;
        resolve(isCompleteSilence);
      }
    });

    ffmpeg.on("error", (err: Error) => {
      reject(new Error(`FFmpeg error checking silence: ${err.message}`));
    });
  });
}