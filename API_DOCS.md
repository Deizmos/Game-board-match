# API Документация - Система Авторизации

## Обзор

Реализована JWT-based система авторизации с использованием access и refresh токенов.

### Особенности:
- **Access токены** - короткий срок жизни (15 минут)
- **Refresh токены** - долгий срок жизни (7 дней)
- **Хеширование паролей** с bcrypt
- **Stateless** архитектура
- **Автоматическое обновление** токенов

## Эндпоинты

### 1. Регистрация
```http
POST /auth/register
Content-Type: application/json

{
  "user_name": "string",
  "password": "string"
}
```

**Ответ:**
```json
{
  "message": "Пользователь успешно создан",
  "user": {
    "id": 1,
    "user_name": "username"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### 2. Вход
```http
POST /auth/login
Content-Type: application/json

{
  "user_name": "string",
  "password": "string"
}
```

**Ответ:**
```json
{
  "message": "Успешный вход",
  "user": {
    "id": 1,
    "user_name": "username",
    "cordinate": "lat,lon"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### 3. Обновление токена
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

**Ответ:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

### 4. Выход
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

### 5. Выход со всех устройств
```http
POST /auth/logout-all
Authorization: Bearer <access_token>
```

### 6. Получение профиля
```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Ответ:**
```json
{
  "user": {
    "id": 1,
    "user_name": "username",
    "cordinate": "lat,lon"
  }
}
```

## Защищенные роуты

### Пример защищенного роута
```http
GET /protected
Authorization: Bearer <access_token>
```

### Получение списка пользователей
```http
GET /users
Authorization: Bearer <access_token>
```

## Использование

### 1. Настройка переменных окружения
Скопируйте `env.example` в `.env` и установите секретные ключи:
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### 2. Регистрация нового пользователя
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"user_name": "testuser", "password": "password123"}'
```

### 3. Вход в систему
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_name": "testuser", "password": "password123"}'
```

### 4. Использование защищенных роутов
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Обновление токена
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## Middleware для защиты роутов

Чтобы защитить любой роут, используйте middleware `authenticateToken`:

```typescript
app.get('/your-protected-route', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // req.user содержит данные авторизованного пользователя
  res.json({ user: req.user });
});
```

## Безопасность

1. **Пароли хешируются** с помощью bcrypt
2. **Access токены** имеют короткий срок жизни
3. **Refresh токены** можно отозвать
4. **JWT секреты** должны быть сложными и уникальными
5. **Валидация входных данных** на всех эндпоинтах

## Обработка ошибок

- `400` - Неверные данные запроса
- `401` - Неавторизованный доступ
- `403` - Недействительный токен
- `409` - Конфликт (пользователь уже существует)
- `500` - Внутренняя ошибка сервера
