import { runCommand } from "../utils/funtions";
import { Request, Response } from "express";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

const downloads = new Map<string, { status: 'processing' | 'completed' | 'failed'; filename?: string; error?: string }>();

export const dowloadSample = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const downloadId = crypto.randomUUID();
  const outDir = path.resolve(process.cwd(), 'audios', downloadId);

  downloads.set(downloadId, { status: 'processing' });

  // Responder inmediatamente con el ID
  res.json({ downloadId, message: 'Download started' });

  // Procesar en background (no esperar)
  (async () => {
    try {
      await fs.promises.mkdir(outDir, { recursive: true });

      const dockerCmd = `sudo docker run --rm -v "${outDir}:/app/out" splice-scraper ${url}`;
      const { stdout, stderr } = await runCommand(dockerCmd);

      console.log(`[${downloadId}] ${stdout}`);
      if (stderr) console.error(`[${downloadId}] ${stderr}`);

      const filename = stdout.match(/Successfully downloaded:\s*(\S+\.(?:wav|mp3))/i)?.[1];

      if (!filename) {
        downloads.set(downloadId, { status: 'failed', error: 'Could not determine downloaded file' });
        return;
      }

      downloads.set(downloadId, { status: 'completed', filename });
    } catch (error) {
      console.error(`[${downloadId}] Error:`, error);
      downloads.set(downloadId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Download failed'
      });
    }
  })();

}

export const getDownloadStatus = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ error: 'Download ID is required' });
    return;
  }

  const download = downloads.get(id);

  if (!download) {
    res.status(404).json({ error: 'Download not found' });
    return;
  }

  res.json(download);
}

export const downloadFile = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ error: 'Download ID is required' });
    return;
  }

  const download = downloads.get(id);

  if (!download) {
    res.status(404).json({ error: 'Download not found' });
    return;
  }

  if (download.status === 'processing') {
    res.status(202).json({ message: 'Download still processing' });
    return;
  }

  if (download.status === 'failed') {
    res.status(500).json({ error: download.error });
    return;
  }

  const filePath = path.join(process.cwd(), 'audios', id, download.filename!);
  res.download(filePath, download.filename!);
}