import { hideBin } from "yargs/helpers";
import yargs from "yargs";

import { launchBrowser } from "./browser/puppeteerUtils";
import { getConfig } from "./config";
import { downloadSample } from "./services/sampleDownloader";
import { initializeOutputDirectory } from "./utils/fileSystem";

interface Arguments {
  testMode?: boolean;
  _: (string | number)[];
  $0: string;
}

const argv = yargs(hideBin(process.argv)).argv as Arguments;
const isTestMode = Boolean(argv.testMode);
const config = getConfig(isTestMode);

console.log(`Running in ${config.mode} mode`);

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
