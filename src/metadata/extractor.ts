import * as cheerio from "cheerio";
import { SampleMetadata } from "../types";

/**
 * Extracts sample ID from a Splice URL
 */
export function extractSampleId(sampleUrl: string): string {
  const match = sampleUrl.match(/\/sounds\/sample\/([^\/\?]+)/);
  return match ? match[1] : sampleUrl.replace("//", "/").split("/")[4];
}

/**
 * Extracts metadata from the sample page HTML
 */
export function extractMetadata(htmlContent: string, sampleUrl: string): SampleMetadata {
  const $ = cheerio.load(htmlContent);
  const sampleId = extractSampleId(sampleUrl);

  const title = $('h1[class^="title"]').first().text();

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
