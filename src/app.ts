import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.ts';
import { usersRouter } from './routes/users.ts';
import { healthRouter } from './routes/health.ts';
import { protectedRouter } from './routes/protected.ts';

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'Game Board Match API',
      version: '0.1.0',
      endpoints: {
        auth: '/auth/*',
        users: '/users',
        health: '/health',
        protected: '/protected'
      }
    });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/health', healthRouter);
  app.use('/protected', protectedRouter);

  return app;
};


