import { JWT_SECRECT } from '../schemas/env';
import jwt from 'jsonwebtoken';

export const verifyToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRECT, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};