import { exec } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export async function runCommand(cmd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`${err.message}\n${stderr}`));
      resolve({ stdout, stderr });
    });
  });
}

export async function cleanAudiosFolder() {
  const audiosDir = path.resolve(process.cwd(), 'audios');
  
  try {
    // Verificar si existe la carpeta
    await fs.promises.access(audiosDir);
    
    // Eliminar la carpeta y todo su contenido
    await fs.promises.rm(audiosDir, { recursive: true, force: true });
    console.log('✓ Carpeta audios limpiada');
  } catch (error) {
    // Si no existe, no hay nada que limpiar
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error limpiando carpeta audios:', error);
    }
  }
}