import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";

puppeteer.use(StealthPlugin());

export interface LaunchBrowserOptions {
  withProxy?: boolean;
  optimized?: boolean;
  args?: string[];
  ignoreDefaultArgs?: string[];
  headless?: boolean | 'new';
  executablePath?: string;
}

/**
 * Launches a Puppeteer browser instance with stealth plugin and optimizations
 * @param options Browser launch configuration
 * @returns Promise with [Browser, Page] tuple
 */
export async function launchBrowser({
  withProxy = false,
  optimized = true,
  args = [],
  ignoreDefaultArgs = [],
  headless = 'new',
  executablePath = undefined,
}: LaunchBrowserOptions = {}): Promise<[Browser, Page]> {
  const browserArgs = [
    ...args,
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
    '--window-size=1920,1080',
    '--window-position=0,0',
  ];

  const browser = await puppeteer.launch({
    executablePath,
    headless,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: browserArgs,
    ignoreDefaultArgs,
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  // Optimize loading by blocking unnecessary resources
  if (optimized) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();

      const shouldBlock =
        resourceType === 'image' ||
        resourceType === 'font' ||
        resourceType === 'stylesheet' ||
        url.includes('.css') ||
        url.includes('analytics');

      const isRecaptcha = url.includes('recaptcha');

      if (shouldBlock && !isRecaptcha) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  await page.setBypassCSP(true);

  return [browser, page];
}


/**
 * Waits for a CSS selector to appear in the DOM based on custom conditions
 * @param page Puppeteer page instance
 * @param initialSelector Initial CSS selector to search from
 * @param condition Function to test if element matches criteria
 * @param selector Function to select the target element from matched element
 * @param allowPreviousScrapingId Whether to allow previously scraped elements
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise with the CSS selector string or undefined
 */
export async function waitForCssSelectorFromDom(
  page: Page,
  initialSelector: string,
  condition: (domElement: Element) => boolean | undefined,
  selector: (matchedElem: Element) => Element | null,
  allowPreviousScrapingId = true,
  timeout = 1000
): Promise<string | undefined> {
  const startTime = Date.now();
  let result: string | undefined;

  do {
    result = await getCssSelectorFromDom(
      page,
      initialSelector,
      condition,
      selector,
      allowPreviousScrapingId
    );
  } while (result == null && Date.now() - startTime < timeout);

  return result;
}

let functionIdCounter = 0;
let scrapingIdCounter = 0;

/**
 * Gets a CSS selector from the DOM by injecting custom condition and selector functions
 * @param page Puppeteer page instance
 * @param initialSelector Initial CSS selector to search from
 * @param condition Function to test if element matches criteria
 * @param selector Function to select the target element from matched element
 * @param allowPreviousScrapingId Whether to allow previously scraped elements
 * @returns Promise with the CSS selector string or undefined
 */
export async function getCssSelectorFromDom(
  page: Page,
  initialSelector: string,
  condition: (domElement: Element) => boolean | undefined,
  selector: (matchedElem: Element) => Element | null,
  allowPreviousScrapingId = true
): Promise<string | undefined> {
  const conditionFuncId = `getCssSelectorFromDom${functionIdCounter++}`;
  const selectorFuncId = `getCssSelectorFromDom${functionIdCounter++}`;
  const scrapingId = `scraping${scrapingIdCounter++}`;

  await page.addScriptTag({
    content: `window.${conditionFuncId} = function(elem){return (${condition})(elem)};`,
  });
  await page.addScriptTag({
    content: `window.${selectorFuncId} = function(elem){return (${selector})(elem)};`,
  });

  const result = await page.evaluate(
    (initialSelector, conditionFuncId, selectorFuncId, scrapingId, allowPreviousScrapingId) => {
      for (const elem of document.querySelectorAll(initialSelector)) {
        const hasScrapingId = elem.getAttribute('scraping_id') != null;
        const shouldProcess = !hasScrapingId || allowPreviousScrapingId;

        if ((window as any)[conditionFuncId](elem) && shouldProcess) {
          const selectedElem = (window as any)[selectorFuncId](elem);
          selectedElem.setAttribute('scraping_id', scrapingId);
          return `${selectedElem.nodeName.toLowerCase()}[scraping_id="${scrapingId}"]`;
        }
      }
      return null;
    },
    initialSelector,
    conditionFuncId,
    selectorFuncId,
    scrapingId,
    allowPreviousScrapingId
  );

  return result;
}

/**
 * Gets all CSS selectors from the DOM that match the given conditions
 * @param page Puppeteer page instance
 * @param initialSelector Initial CSS selector to search from
 * @param condition Function to test if element matches criteria
 * @param selector Function to select the target element from matched element
 * @returns Promise with array of CSS selector strings
 */
export async function getAllCssSelectorsFromDom(
  page: Page,
  initialSelector: string,
  condition: (domElement: Element) => boolean | undefined,
  selector: (matchedElem: Element) => Element | null
): Promise<string[]> {
  const selectors: string[] = [];
  let currentSelector: string | undefined = null;

  do {
    currentSelector = await getCssSelectorFromDom(
      page,
      initialSelector,
      condition,
      selector,
      false
    );
    if (currentSelector != null) {
      selectors.push(currentSelector);
    }
  } while (currentSelector != null);

  return selectors;
}

/**
 * Scrolls an element into view multiple times to ensure visibility
 * @param page Puppeteer page instance
 * @param selector CSS selector of the element to scroll to
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  const SCROLL_ATTEMPTS = 10;
  for (let i = 0; i < SCROLL_ATTEMPTS; i++) {
    await page.$eval(selector, (elem) => elem.scrollIntoView());
  }
}