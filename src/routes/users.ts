import { Router, Response } from 'express';
import { authenticateToken } from '../auth/middleware.ts';
import { AuthenticatedRequest } from '../types.ts';
import { db } from '../db.ts';

export const usersRouter = Router();

usersRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.prepare('SELECT id, user_name, cordinate, created_at FROM users').all();
    res.json({ users });
  } catch (error) {
    console.error('[users] Get users error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});


