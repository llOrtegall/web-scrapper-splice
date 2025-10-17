import { spawn } from 'node:child_process';
import { writeFile, stat, unlink, readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

export async function convertAudio(buff: Uint8Array | ArrayBuffer) {
  // Convertir a Buffer
  const inputBuffer = buff instanceof Uint8Array 
    ? Buffer.from(buff.buffer, buff.byteOffset, buff.byteLength)
    : Buffer.from(buff);

  // Generar nombres únicos para archivos temporales
  const uniqueId = randomBytes(8).toString('hex');
  const tempInputPath = `/home/ortega/web-scrapper-splice/api/audios/input_${uniqueId}.mp3`;
  const tempOutputPath = `/home/ortega/web-scrapper-splice/api/audios/output_${uniqueId}.wav`;

  try {
    // Guardar el archivo MP3 recibido
    await writeFile(tempInputPath, inputBuffer);

    // Verificar que el archivo se guardó correctamente
    const fileStats = await stat(tempInputPath);
    
    if (fileStats.size === 0) {
      throw new Error('El archivo MP3 guardado está vacío');
    }

    // Procesar con FFmpeg para convertir a WAV y remover metadata/licencias
    return new Promise<Buffer>((resolve, reject) => {
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

      ffmpeg.on('close', async (code) => {
        // Limpiar el archivo MP3 temporal
        try {
          await unlink(tempInputPath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp input file:', cleanupError);
        }

        if (code === 0) {
          try {
            // Leer el archivo WAV generado
            const wavBuffer = await readFile(tempOutputPath);
            
            // Limpiar el archivo WAV temporal
            try {
              await unlink(tempOutputPath);
            } catch (cleanupError) {
              console.error('Error cleaning up temp output file:', cleanupError);
            }
            
            resolve(wavBuffer);
          } catch (readError) {
            reject(new Error(`Error reading output file: ${readError}`));
          }
        } else {
          // Si falla, limpiar también el output si existe
          try {
            await unlink(tempOutputPath);
          } catch {}
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });
  } catch (error) {
    console.error('Error in convertAudio:', error);
    return Promise.reject(error);
  }
}