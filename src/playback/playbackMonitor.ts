import cliProgress from "cli-progress";
import { Page } from "puppeteer";
import { getCssSelectorFromDom } from "../browser/puppeteerUtils";
import { PROGRESS_SELECTOR } from "../constants";

/**
 * Finds and clicks the Play button on the sample page
 */
export async function clickPlayButton(page: Page): Promise<void> {
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
export async function monitorPlaybackProgress(page: Page): Promise<void> {
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
