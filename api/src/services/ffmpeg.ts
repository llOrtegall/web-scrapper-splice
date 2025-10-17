import { spawn } from 'node:child_process';
import { writeFile, stat } from 'node:fs/promises';

export async function convertAudio(buff: ArrayBuffer) {
  // Convertir ArrayBuffer a Buffer
  const inputBuffer = Buffer.from(buff);

  // Rutas temporales
  const tempInputPath = '/home/ortega/web-scrapper-splice/api/audios/input_audio.mp3';
  const tempOutputPath = '/home/ortega/web-scrapper-splice/api/audios/output_audio.wav';

  try {
    // Guardar el archivo MP3 recibido
    await writeFile(tempInputPath, inputBuffer);

    // Verificar que el archivo se guardó correctamente
    const fileStats = await stat(tempInputPath);
    
    if (fileStats.size === 0) {
      throw new Error('El archivo MP3 guardado está vacío');
    }

    // Procesar con FFmpeg para convertir a WAV y remover metadata/licencias
    return new Promise<string>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y', // Sobrescribir archivos de salida
        '-i', tempInputPath,
        '-c:a', 'pcm_s16le',
        '-ar', '44100',
        '-ac', '2',
        '-map_metadata', '-1', // Remover metadata
        '-id3v2_version', '0', // Remover tags ID3v2
        tempOutputPath
      ]);

      ffmpeg.on('error', (error) => {
        console.error('Error starting ffmpeg:', error);
        reject(error);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(`ffmpeg stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(tempOutputPath);
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });
  } catch (error) {
    console.error('Error in convertAudio:', error);
    return Promise.reject(error);
  }
}