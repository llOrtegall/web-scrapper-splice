import express, { type Request, type Response } from 'express';
import { exec } from 'node:child_process';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function runCommand(cmd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`${err.message}\n${stderr}`));
      resolve({ stdout, stderr });
    });
  });
}

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Almacenar estado de descargas en memoria
const downloads = new Map<string, { status: 'processing' | 'completed' | 'failed'; filename?: string; error?: string }>();

app.get('/api/health', (req, res) => {
  res.status(200).send('API is healthy');
});

// Iniciar descarga (no bloquea)
app.post('/download', async (req: Request, res: Response) => {
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
});

// Consultar estado de la descarga
app.get('/download/:id/status', (req: Request, res: Response) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'Download ID is required' });
  }
  
  const download = downloads.get(id);

  if (!download) {
    return res.status(404).json({ error: 'Download not found' });
  }

  res.json(download);
});

// Descargar el audio cuando esté listo
app.get('/download/:id/file', (req: Request, res: Response) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'Download ID is required' });
  }
  
  const download = downloads.get(id);

  if (!download) {
    return res.status(404).json({ error: 'Download not found' });
  }

  if (download.status === 'processing') {
    return res.status(202).json({ message: 'Download still processing' });
  }

  if (download.status === 'failed') {
    return res.status(500).json({ error: download.error });
  }

  const filePath = path.join(process.cwd(), 'audios', id, download.filename!);
  res.download(filePath, download.filename!);
});

app.listen(PORT, () => {
  console.log(`API server is running on port http://localhost:${PORT}`);
});