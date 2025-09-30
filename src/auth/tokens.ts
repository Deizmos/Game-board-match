import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, JWT_SECRET, JWT_REFRESH_SECRET } from '../config.ts';
import { updateUserTokens } from '../db.ts';

export const generateTokens = (userId: number) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const saveRefreshToken = (userId: number, token: string) => {
  // В новой схеме сохраняем сразу оба токена на пользователе;
  // предполагается, что access/refresh уже сгенерированы выше и будут переданы отдельно при вызовах из роутов
  // Здесь оставим только совместимостьный хелпер для refresh токена, не используем срок годности в БД
  // Фактическая валидация срока — через подпись JWT
  // Обновление access_token выполняется в местах вызова
  updateUserTokens.run(null, token, userId);
};


