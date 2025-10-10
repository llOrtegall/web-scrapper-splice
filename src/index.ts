import { ChildProcess, spawn } from "child_process";
import { hideBin } from "yargs/helpers";
import cliProgress from "cli-progress";
import * as cheerio from "cheerio";
import { Page } from "puppeteer";
import yargs from "yargs";
import path from "path";
import fs from "fs";

import { getCssSelectorFromDom, launchBrowser } from "./utils";
import { isEntireAudioSilent, waitForSilence } from "./audioUtils";
import { SampleMetadata, RecordingOptions } from "./types";
import { getConfig, Config } from "./config";

interface Arguments {
  testMode?: boolean;
  _: (string | number)[];
  $0: string;
}

const argv = yargs(hideBin(process.argv)).argv as Arguments;
const isTestMode = Boolean(argv.testMode);
const config = getConfig(isTestMode);

// Recording constants
const AUDIO_CODEC = "pcm_s24le";
const SAMPLE_RATE = "48000";
const PROGRESS_SELECTOR = 'progress[class*="progress-bar"]';
const NETWORK_IDLE_TIME = 1000;
const RECORDING_STOP_DELAY = 500;

console.log(`Running in ${config.mode} mode`);

/**
 * Extracts sample ID from a Splice URL
 */
function extractSampleId(sampleUrl: string): string {
  const match = sampleUrl.match(/\/sounds\/([^\/]+)/);
  return match ? match[1] : sampleUrl.replace("//", "/").split("/")[4];
}

/**
 * Extracts metadata from the sample page HTML
 */
function extractMetadata(htmlContent: string, sampleUrl: string): SampleMetadata {
  const $ = cheerio.load(htmlContent);
  const sampleId = extractSampleId(sampleUrl);

  const title = $('[class^="title "]').first().text();

  let bpm: string | null = null;
  try {
    const bpmElement = $("*").filter((i, el) => $(el).text().toLowerCase() === "bpm");
    bpm = $(bpmElement[0].parent.lastChild).text();
    console.log(`BPM: ${bpm}`);
  } catch (e) {
    console.log("BPM not found (might be a one-shot sample)");
  }

  const subheadingLinks = $(".subheading").children("a");
  const samplePack = $(subheadingLinks[0]).text();
  const author = $(subheadingLinks[1]).text();

  return {
    title,
    artist: author,
    album: samplePack,
    bpm,
    fileUrl: sampleUrl,
    sampleId,
  };
}

/**
 * Saves sample metadata to a JSON file
 */
function saveMetadata(outputPath: string, metadata: SampleMetadata): void {
  fs.writeFileSync(`${outputPath}.json`, JSON.stringify(metadata, null, 2));
  console.log("✓ Metadata saved");
}

/**
 * Downloads and records a sample from Splice
 */
async function downloadSample(
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

  const outputFilePathWithoutExt = path.resolve(
    path.join(config.outputDir, metadata.sampleId)
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

/**
 * Finds and clicks the Play button on the sample page
 */
async function clickPlayButton(page: Page): Promise<void> {
  const selector = await getCssSelectorFromDom(
    page,
    "span",
    (elem) => elem.innerHTML.includes("Play"),
    (elem) => elem
  );
  await page.click(selector);
}

/**
 * Gets current playback progress from the page
 */
async function getProgress(page: Page): Promise<number> {
  return parseFloat(
    await page.$eval(PROGRESS_SELECTOR, (e) => e.getAttribute("value"))
  );
}

/**
 * Waits for playback progress to meet a condition
 */
async function waitForProgressCondition(
  page: Page,
  bar: cliProgress.SingleBar,
  condition: (progress: number) => boolean
): Promise<void> {
  let progress: number;
  do {
    progress = await getProgress(page);
    bar.update(progress);
  } while (condition(progress));
}

/**
 * Monitors the sample playback progress bar
 */
async function monitorPlaybackProgress(page: Page): Promise<void> {
  await page.waitForSelector(PROGRESS_SELECTOR);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(1, 0);

  // Wait for playback to start (progress > 0)
  await waitForProgressCondition(page, bar, (p) => p <= 0);

  // Wait for playback to finish (progress returns to 0)
  await waitForProgressCondition(page, bar, (p) => p > 0);

  bar.stop();
  console.log("Finished sample playback");
}

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
 * Starts recording audio using FFmpeg
 */
function startRecording(
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
async function stopRecording(recordingHandle: ChildProcess): Promise<void> {
  console.log("Stopping recording...");
  recordingHandle.kill("SIGINT");
  await new Promise((resolve) => setTimeout(resolve, RECORDING_STOP_DELAY));
  console.log("Stopped recording");
}

/**
 * Initializes the output directory
 */
function initializeOutputDirectory(outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Main entry point
 */
(async () => {
  try {
    const sampleUrl = process.argv[2];

    if (!sampleUrl) {
      console.error("Error: Please provide a sample URL as an argument");
      console.log("Usage: npm run dev <sample-url> [--testMode]");
      process.exit(1);
    }

    console.log(`Configuration: ${config.mode} mode`);
    console.log(`Output directory: ${config.outputDir}`);
    console.log(`Recording device: ${config.recordingDevice}`);

    initializeOutputDirectory(config.outputDir);

    const [browser, page] = await launchBrowser({
      withProxy: false,
      optimized: false,
      headless: config.browserHeadless,
      args: config.browserArgs,
      ignoreDefaultArgs: ["--mute-audio"],
      executablePath: config.executablePath,
    });

    await downloadSample(page, sampleUrl, config);

    console.log("\n✓ Download completed successfully!");

    if (isTestMode) {
      console.log("Test mode: Keeping browser open for inspection...");
      await new Promise((resolve) => setTimeout(resolve, 99999));
    }

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error during download:");
    console.error(error);
    process.exit(1);
  }
})();
