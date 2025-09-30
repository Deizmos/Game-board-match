## Бэкенд-основа (Node.js + TypeScript)

Backend для Game Board Match с Express-сервером, SQLite базой данных и JWT системой авторизации.

### Требования
- Node.js >= 22.0.0 (LTS)
- npm >= 11.0.0

### Установка
```bash
npm install
```

### Запуск в разработке
```bash
npm run dev
```
Откройте `http://localhost:3000/health` — должно вернуть `{ "status": "ok" }`.

### Сборка и запуск в проде
```bash
npm run build
npm start
```

### Переменные окружения
Скопируйте `.env.example` в `.env` (если файла нет, создайте его) и при необходимости измените:
```
PORT=3000
NODE_ENV=development
```

### Скрипты
- `dev` — запуск с авто-ребилдом через `tsx watch`
- `build` — компиляция TypeScript в `dist`
- `start` — запуск собранной версии `dist/index.js`
- `typecheck` — проверка типов без эмита

### Функциональность
- ✅ Express сервер с health-check
- ✅ SQLite база данных с пользователями
- ✅ JWT система авторизации (access + refresh токены)
- ✅ Хеширование паролей с bcrypt
- ✅ Middleware для защиты роутов
- ✅ API для регистрации, входа и управления токенами

### API Документация
Подробная документация по API доступна в файле `API_DOCS.md`


