# Настройка Firebase для GameBoardMatch

## 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com)
2. Нажмите "Создать проект"
3. Введите название проекта (например: `gameboardmatch`)
4. Включите Google Analytics (опционально)
5. Создайте проект

## 2. Настройка Authentication

1. В левом меню выберите "Authentication"
2. Перейдите на вкладку "Sign-in method"
3. Включите "Email/Password" провайдер
4. Нажмите "Сохранить"

## 3. Настройка Firestore Database

1. В левом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите "Начать в тестовом режиме" (для разработки)
4. Выберите регион (например: europe-west1)
5. Нажмите "Готово"

## 4. Получение конфигурации

1. В левом меню выберите "Project settings" (шестеренка)
2. Прокрутите вниз до "Your apps"
3. Нажмите на иконку веб-приложения (</>)
4. Введите название приложения (например: `gameboardmatch-web`)
5. Скопируйте конфигурацию Firebase

## 5. Создание файла .env

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=ваш_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ваш_проект.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ваш_проект_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ваш_проект.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ваш_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=ваш_app_id
```

## 6. Правила безопасности Firestore

В разделе "Firestore Database" > "Правила" установите следующие правила для разработки:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешить чтение и запись для всех пользователей (только для разработки!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Внимание**: Эти правила разрешают доступ всем пользователям. Для продакшена нужно настроить более строгие правила.

## 7. Перезапуск приложения

После настройки `.env` файла:

```bash
# Остановите сервер (Ctrl+C)
# Перезапустите приложение
npm start
```

## 8. Проверка работы

1. Откройте приложение
2. Перейдите на экран регистрации
3. Заполните форму и нажмите "Создать аккаунт"
4. Проверьте в Firebase Console > Authentication > Users - должен появиться новый пользователь
5. Проверьте в Firebase Console > Firestore Database - должна появиться коллекция `users` с данными пользователя

## Демо-режим

Если вы не хотите настраивать Firebase сейчас, приложение будет работать в демо-режиме:
- Регистрация будет имитироваться
- Данные не будут сохраняться в Firebase
- В консоли будут появляться сообщения о демо-режиме
