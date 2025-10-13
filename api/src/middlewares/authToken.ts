import { Request, Response, NextFunction } from 'express';
import { JWT_SECRECT } from '../schemas/env.js';
import jwt from 'jsonwebtoken';

interface UserPayLoad extends jwt.JwtPayload {
  id: string,
  username: string,
  role: string,
  iat: number,
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayLoad;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const cookie = req.headers.cookie

  if (!cookie) {
    res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    return;
  }

  try {
    const token = cookie.split('=')[1]

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
      return;
    }

    jwt.verify(token, JWT_SECRECT, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
      }

      req.user = decoded as UserPayLoad;
      next();
    });

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return
    }
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};