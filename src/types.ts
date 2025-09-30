import { Request } from 'express';

export interface User {
  id: number;
  user_name: string;
  password: string;
  cordinate?: string;
  access_token?: string | null;
  refresh_token?: string | null;
}

// Таблица refresh_tokens удалена, токены храним в users

export interface AuthenticatedRequest extends Request {
  user?: User;
}


