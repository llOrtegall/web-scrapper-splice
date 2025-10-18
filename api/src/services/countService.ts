import { Count } from "../models/count.m.js";
import { UserPayLoad } from "../middlewares/authToken.js";

type CountType = 'countPlay' | 'countDownload' | 'countProcess';

/**
 * Incrementa el contador especificado para un usuario.
 * Esta función se ejecuta de forma asíncrona sin bloquear el flujo principal.
 * 
 * @param username - Nombre del usuario
 * @param countType - Tipo de contador a incrementar
 */
async function incrementUserCount(username: string, countType: CountType): Promise<void> {
  try {
    const nowDate = new Date();
    
    // Usar findOrCreate para reducir de 2 queries a 1
    const [record, created] = await Count.findOrCreate({
      where: {
        username,
        dateSave: nowDate
      },
      defaults: {
        username,
        dateSave: nowDate,
        [countType]: 1
      }
    });

    // Si ya existía, incrementar el contador
    if (!created) {
      await record.increment(countType);
    }
  } catch (error) {
    // Log del error pero no propagar para no afectar la respuesta al cliente
    console.error(`Error incrementing ${countType} for user ${username}:`, error);
  }
}

/**
 * Registra un play de audio de forma asíncrona (fire-and-forget).
 * No bloquea la respuesta al cliente.
 * 
 * @param user - Objeto de usuario del request
 */
export function registerPlay(user: unknown): void {
  if (user && typeof user === 'object') {
    const userData = user as UserPayLoad;
    // Ejecutar sin await para no bloquear
    incrementUserCount(userData.username, 'countPlay').catch(err => {
      console.error('Failed to register play:', err);
    });
  }
}

/**
 * Registra una descarga de audio de forma asíncrona (fire-and-forget).
 * No bloquea la respuesta al cliente.
 * 
 * @param user - Objeto de usuario del request
 */
export function registerDownload(user: unknown): void {
  if (user && typeof user === 'object') {
    const userData = user as UserPayLoad;
    // Ejecutar sin await para no bloquear
    incrementUserCount(userData.username, 'countDownload').catch(err => {
      console.error('Failed to register download:', err);
    });
  }
}

/**
 * Registra un proceso de audio de forma asíncrona (fire-and-forget).
 * No bloquea la respuesta al cliente.
 * 
 * @param user - Objeto de usuario del request
 */
export function registerProcess(user: unknown): void {
  if (user && typeof user === 'object') {
    const userData = user as UserPayLoad;
    // Ejecutar sin await para no bloquear
    incrementUserCount(userData.username, 'countProcess').catch(err => {
      console.error('Failed to register process:', err);
    });
  }
}
