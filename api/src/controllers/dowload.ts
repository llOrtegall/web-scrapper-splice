import { runCommand, baseDirAudios } from "../utils/funtions.js";
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
  const outDir = path.resolve(baseDirAudios, downloadId);

  downloads.set(downloadId, { status: 'processing' });

  // Responder inmediatamente con el ID
  res.json({ downloadId, message: 'Download started' });

  // Procesar en background (no esperar)
  (async () => {
    try {
      await fs.promises.mkdir(outDir, { recursive: true });

      const dockerCmd = `docker run --rm -v "${outDir}:/app/out" splice-scraper ${url}`;
      const { stdout, stderr } = await runCommand(dockerCmd);

      console.log(`[${downloadId}] ${stdout}`);
      if (stderr) console.error(`[${downloadId}] ${stderr}`);

      // Intentar extraer el filename del stdout
      let filename = stdout.match(/Successfully downloaded:\s*(\S+\.(?:wav|mp3))/i)?.[1];

      // Si no se encontró en el stdout, buscar en el filesystem
      if (!filename) {
        console.log(`[${downloadId}] No se encontró filename en stdout, buscando en filesystem...`);
        const files = await fs.promises.readdir(outDir);
        filename = files.find(file => file.endsWith('.mp3') || file.endsWith('.wav'));
      }

      if (!filename) {
        downloads.set(downloadId, { status: 'failed', error: 'Could not determine downloaded file try again or verify link is correct' });
        return;
      }

      console.log(`[${downloadId}] Archivo encontrado: ${filename}`);
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
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Download ID is required' });
    return;
  }

  try {
    const folderPath = path.join(baseDirAudios, id);

    // Verificar si la carpeta existe
    if (!fs.existsSync(folderPath)) {
      res.status(404).json({ error: 'Download folder not found' });
      return;
    }

    // Leer los archivos de la carpeta
    const files = await fs.promises.readdir(folderPath);

    // Buscar archivo de audio (mp3 o wav)
    const audioFile = files.find(file => file.endsWith('.mp3') || file.endsWith('.wav'));

    if (!audioFile) {
      res.status(404).json({ error: 'Audio file not found in folder' });
      return;
    }

    const filePath = path.join(folderPath, audioFile);
    res.download(filePath, audioFile);
  } catch (error) {
    console.error(`Error downloading file for ID ${id}:`, error);
    res.status(500).json({ 
      error: 'Error retrieving audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}