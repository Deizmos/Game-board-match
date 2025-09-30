import { Router, Response } from 'express';
import { authenticateToken } from '../auth/middleware.ts';
import { AuthenticatedRequest } from '../types.ts';

export const protectedRouter = Router();

protectedRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Это защищенный роут!',
    user: {
      id: req.user?.id,
      user_name: req.user?.user_name
    }
  });
});


