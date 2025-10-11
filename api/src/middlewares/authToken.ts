import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/verifyToken';
import jwt from 'jsonwebtoken';

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

    await verifyToken(token)
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return 
    }
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return 
  }
};