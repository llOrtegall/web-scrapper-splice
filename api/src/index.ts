import express, { type Request, type Response } from 'express';
import { exec } from 'node:child_process';
import cors from 'cors';

async function waitForCommand(cmd: string, onComplete: (err: Error | null, stdout: string, stderr: string) => void): Promise<void> {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      onComplete(err, stdout, stderr)
      resolve()
    })
  })
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

  // execute docker container to get audio using node child_process
  try {
    const dockerCmd = `sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper ${url}`;

    await waitForCommand(dockerCmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error executing command: ${err.message}`);
        return res.status(500).json({ error: 'Failed to process the URL' });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);

      return res.status(200).json({ message: 'Audio downloaded successfully', output: stdout.trim() });
    })
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }

})

app.listen(PORT, () => {
  console.log(`API server is running on port http://localhost:${PORT}`);
});