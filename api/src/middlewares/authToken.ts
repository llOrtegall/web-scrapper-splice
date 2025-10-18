import { Request, Response, NextFunction } from 'express';
import { extractCookieValue } from '../utils/token.js';
import { COOKIE_NAME } from '../schemas/env.js';
import { JWT_SECRECT } from '../schemas/env.js';
import jwt from 'jsonwebtoken';
/**
 * Payload del token JWT con información del usuario
 */
export interface UserPayLoad extends jwt.JwtPayload {
  id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayLoad;
    }
  }
}

/**
 * Middleware de autenticación que verifica el token JWT en las cookies
 * Busca específicamente la cookie 'splice-token-winkermind' para evitar conflictos
 * con otras cookies externas del frontend
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const cookieHeader = req.headers.cookie;

  // Verificar que exista el header de cookies
  if (!cookieHeader) {
    res.status(401).json({ 
      message: 'Unauthorized: No authentication cookie found' 
    });
    return;
  }

  // Extraer el token específico de las cookies
  const tokenValue = extractCookieValue(cookieHeader, COOKIE_NAME);

  if (!tokenValue) {
    res.status(401).json({ 
      message: 'Unauthorized: Authentication token not found',
      hint: `Expected cookie: ${COOKIE_NAME}`
    });
    return;
  }

  // Verificar y decodificar el token
  try {
    const decoded = jwt.verify(tokenValue, JWT_SECRECT) as UserPayLoad;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Error inesperado
    res.status(500).json({ message: 'Authentication error' });
  }
};