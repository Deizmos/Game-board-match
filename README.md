# GameBoardMatch - Регистрация

Простое приложение для регистрации пользователей с использованием Firebase Authentication.

## Особенности

- 🔐 Регистрация через Firebase Authentication
- 📱 Адаптивный дизайн для iOS и Android
- 🎨 Современный UI с Tamagui

## Технологии

- **Frontend**: React Native + Expo
- **Backend**: Firebase Authentication
- **UI**: Tamagui
- **State Management**: Zustand
- **Навигация**: Expo Router

## Быстрый старт

1. Установите зависимости:
```bash
npm install
```

2. Настройте Firebase:
   - Скопируйте `.env.example` в `.env`
   - Заполните конфигурацию Firebase Authentication

3. Запустите приложение:
```bash
npm start
```

## Структура проекта

```
app/
├── _layout.tsx     # Главный layout
└── register.tsx    # Экран регистрации

src/
├── components/     # Переиспользуемые компоненты (пустая)
├── services/       # Firebase сервисы
├── store/          # Zustand store для аутентификации
├── types/          # TypeScript типы
└── constants/      # Константы приложения
```

## Функционал

Приложение содержит только экран регистрации с полями:
- Имя
- Email
- Возраст
- Пароль
- Подтверждение пароля

После успешной регистрации пользователь получает уведомление об успехе.

## Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com)
2. Включите Authentication с Email/Password
3. Скопируйте конфигурацию в `.env` файл:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```