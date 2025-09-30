import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types.ts';
import { JWT_SECRET } from '../config.ts';
import { getUserById } from '../db.ts';
import { User } from '../types.ts';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; type: string };
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Неверный тип токена' });
    }

    const user = getUserById.get(decoded.userId) as User;
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};


