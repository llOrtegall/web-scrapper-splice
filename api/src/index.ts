import express, { type Request, type Response } from 'express';
import { exec } from 'node:child_process';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

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

// Example route
app.get('/api/health', (req, res) => {
  res.status(200).send('API is healthy');
});

app.post('/download', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const outDir = path.resolve(process.cwd(), 'audios');
  await fs.promises.mkdir(outDir, { recursive: true });

  try {
    // Ejecutar el contenedor Docker
    const dockerCmd = `sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper ${url}`;
    const { stdout, stderr } = await runCommand(dockerCmd);
    
    console.log(stdout);
    if (stderr) console.error(stderr);

    // Extraer el nombre del archivo del log
    const filename = stdout.match(/Successfully downloaded:\s*(\S+\.(?:wav|mp3))/i)?.[1];
    
    if (!filename) {
      return res.status(500).json({ error: 'Could not determine downloaded file from log' });
    }

    // Enviar el audio
    res.download(path.join(outDir, filename), filename);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server is running on port http://localhost:${PORT}`);
});