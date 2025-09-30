import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByUsername, db, getUserByRefreshToken, updateUserTokens, clearUserTokensById } from '../db.ts';
import { AuthenticatedRequest, User } from '../types.ts';
import { authenticateToken } from '../auth/middleware.ts';
import { generateTokens } from '../auth/tokens.ts';
import { JWT_REFRESH_SECRET } from '../config.ts';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { user_name, password } = req.body;

    if (!user_name || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }

    const existingUser = getUserByUsername.get(user_name) as User;
    if (existingUser) {
      return res.status(409).json({ error: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUser = db.prepare('INSERT INTO users (user_name, password) VALUES (?, ?)');
    const result = insertUser.run(user_name, hashedPassword);
    const userId = result.lastInsertRowid as number;

    const { accessToken, refreshToken } = generateTokens(userId);
    updateUserTokens.run(accessToken, refreshToken, userId);

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: { id: userId, user_name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('[auth] Registration error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { user_name, password } = req.body;

    if (!user_name || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    const user = getUserByUsername.get(user_name) as User;
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    updateUserTokens.run(accessToken, refreshToken, user.id);

    res.json({
      message: 'Успешный вход',
      user: { id: user.id, user_name: user.user_name, cordinate: user.cordinate },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('[auth] Login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

authRouter.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh токен обязателен' });
    }

    let decoded: { userId: number; type: string };
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number; type: string };
    } catch (_error) {
      return res.status(403).json({ error: 'Недействительный refresh токен' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Неверный тип токена' });
    }

    const userWithToken = getUserByRefreshToken.get(refreshToken) as User | undefined;
    if (!userWithToken || userWithToken.id !== decoded.userId) {
      return res.status(403).json({ error: 'Refresh токен не найден' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    updateUserTokens.run(accessToken, newRefreshToken, decoded.userId);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('[auth] Refresh error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

authRouter.post('/logout', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const userWithToken = getUserByRefreshToken.get(refreshToken) as User | undefined;
      if (userWithToken) {
        clearUserTokensById.run(userWithToken.id);
      }
    }
    res.json({ message: 'Успешный выход' });
  } catch (error) {
    console.error('[auth] Logout error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

authRouter.post('/logout-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      clearUserTokensById.run(req.user.id);
    }
    res.json({ message: 'Выход со всех устройств выполнен' });
  } catch (error) {
    console.error('[auth] Logout all error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      res.json({
        user: {
          id: req.user.id,
          user_name: req.user.user_name,
          cordinate: req.user.cordinate
        }
      });
    } else {
      res.status(401).json({ error: 'Пользователь не авторизован' });
    }
  } catch (error) {
    console.error('[auth] Get profile error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});


