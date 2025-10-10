import { ChildProcess, spawn } from "child_process";
import { RecordingOptions } from "../types";
import { AUDIO_CODEC, SAMPLE_RATE, RECORDING_STOP_DELAY } from "../constants";

/**
 * Starts recording audio using FFmpeg
 */
export function startRecording(
  filePath: string,
  recordingOptions: RecordingOptions
): ChildProcess {
  console.log(`Starting recording to: ${filePath}`);

  const ffmpegArgs = [
    "-y", // Overwrite output file
    "-f",
    recordingOptions.audioInput,
    "-i",
    recordingOptions.deviceName,
    "-acodec",
    AUDIO_CODEC,
    "-ar",
    SAMPLE_RATE,
    filePath,
  ];

  const procHandle = spawn("ffmpeg", ffmpegArgs);

  // Log FFmpeg output on close (stdout/stderr buffering avoided for large outputs)
  procHandle.on("close", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`FFmpeg exited with code ${code}`);
    }
  });

  // Only log FFmpeg errors
  procHandle.stderr.on("data", (err: Buffer) => {
    const errorMsg = err.toString();
    if (errorMsg.includes("Error") || errorMsg.includes("error")) {
      console.error("FFmpeg error:", errorMsg);
    }
  });

  return procHandle;
}

/**
 * Stops the FFmpeg recording process
 */
export async function stopRecording(recordingHandle: ChildProcess): Promise<void> {
  console.log("Stopping recording...");
  recordingHandle.kill("SIGINT");
  await new Promise((resolve) => setTimeout(resolve, RECORDING_STOP_DELAY));
  console.log("Stopped recording");
}
