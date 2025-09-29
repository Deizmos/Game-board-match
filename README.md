## Бэкенд-основа (Node.js + TypeScript)

Минимальная основа без структуры папок: один файл `index.ts` с Express-сервером и health-чеком.

### Требования
- Node.js >= 20

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


