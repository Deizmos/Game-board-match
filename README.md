# Game Board Match — мобильное приложение (Expo)

Приложение React Native на Expo на базе вашего бэкенда (`game-board-match-bekend`).

## Требования
- Node.js LTS
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode) или Android Emulator (Android Studio) при необходимости

## Установка
```bash
cd ~/dev/game-board-match
npm install
```

## Настройки окружения
Базовый URL API задаётся через `app.json` → `extra.EXPO_PUBLIC_API_URL`.
По умолчанию: `http://localhost:3000/api`

Если запускаете приложение на реальном устройстве, укажите LAN IP хоста:
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "http://<LAN_IP>:3000/api"
    }
  }
}
```

## Запуск
```bash
npm run ios   # iOS симулятор
npm run android  # Android эмулятор
npm run web   # В браузере
```

Убедитесь, что бэкенд запущен на `http://localhost:3000`:
```bash
cd ~/dev/game-board-match-bekend
npm run dev
```

## Функциональность
- Вход / Регистрация (экраны в `app/(auth)`), хранение токенов через `expo-secure-store`
- Обновление токена по `POST /api/auth/refresh`
- Пример главного экрана с приветствием пользователя и кнопкой «Выйти»

## Структура
- `lib/api.ts` — axios-клиент, интерсепторы, хранение токенов
- `lib/auth.ts` — API авторизации (`login`, `register`, `me`, `logout`)
- `app/index.tsx` — редирект в зависимости от авторизации
- `app/(auth)/*` — экраны авторизации
- `app/(tabs)/*` — табы после входа


