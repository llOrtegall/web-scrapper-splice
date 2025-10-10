import path from "path";
import fs from "fs";
import { Page } from "puppeteer";
import { Config } from "../config";
import { RecordingOptions } from "../types";
import { extractMetadata } from "../metadata/extractor";
import { startRecording, stopRecording } from "../recording/ffmpegRecorder";
import { clickPlayButton, monitorPlaybackProgress } from "../playback/playbackMonitor";
import { isEntireAudioSilent, waitForSilence } from "../audioUtils";
import { sanitizeFileName, saveMetadata } from "../utils/fileSystem";
import { NETWORK_IDLE_TIME } from "../constants";

/**
 * Records a single take of a sample
 */
async function recordSampleTake(
  page: Page,
  outputFilePathWithoutExt: string,
  recordingOptions: RecordingOptions
): Promise<string> {
  const takeOutputPath = `${outputFilePathWithoutExt}_0.wav`;
  const recordingHandle = startRecording(takeOutputPath, recordingOptions);

  await page.waitForNetworkIdle({ idleTime: NETWORK_IDLE_TIME });
  await clickPlayButton(page);
  await monitorPlaybackProgress(page);

  // Wait for audio to finish and silence to be detected
  await waitForSilence(recordingOptions);

  await stopRecording(recordingHandle);

  return takeOutputPath;
}

/**
 * Downloads and records a sample from Splice
 */
export async function downloadSample(
  page: Page,
  sampleUrl: string,
  config: Config
): Promise<void> {
  console.log(`\nDownloading sample: ${sampleUrl}`);

  await page.goto(sampleUrl);
  await page.waitForNetworkIdle({ idleTime: NETWORK_IDLE_TIME });

  const htmlContent = await page.content();
  const metadata = extractMetadata(htmlContent, sampleUrl);

  console.log(
    `Sample info - Title: ${metadata.title} | BPM: ${metadata.bpm} | Pack: ${metadata.album} | Author: ${metadata.artist}`
  );

  // Use sanitized title as filename
  const sanitizedTitle = sanitizeFileName(metadata.title);
  const outputFilePathWithoutExt = path.resolve(
    path.join(config.outputDir, sanitizedTitle)
  );

  const recordingOptions: RecordingOptions = {
    deviceName: config.recordingDevice,
    audioInput: config.ffmpegAudioInput,
  };

  // Record sample, retrying if the recording is silent
  let takeFile: string;
  do {
    takeFile = await recordSampleTake(
      page,
      outputFilePathWithoutExt,
      recordingOptions
    );
  } while (await isEntireAudioSilent(takeFile));

  // Move the successful recording to final location
  fs.cpSync(takeFile, `${outputFilePathWithoutExt}.wav`);
  fs.rmSync(takeFile);

  saveMetadata(outputFilePathWithoutExt, metadata);

  console.log(`✓ Successfully downloaded: ${metadata.title}`);
}
