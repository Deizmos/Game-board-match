# ✅ Чек-лист настройки Firebase

## 1. Проверьте Authentication в Firebase Console

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите проект `game-board-match`
3. В левом меню выберите **Authentication**
4. Перейдите на вкладку **Sign-in method**
5. Убедитесь, что включен провайдер **Email/Password**
6. Если не включен - нажмите на него и включите

## 2. Проверьте Firestore Database

1. В левом меню выберите **Firestore Database**
2. Убедитесь, что база данных создана
3. Если нет - нажмите **Создать базу данных**
4. Выберите **Начать в тестовом режиме** (для разработки)

## 3. Правила безопасности Firestore (для разработки)

В разделе **Firestore Database** > **Правила** установите:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Важно**: Эти правила разрешают доступ всем пользователям. Используйте только для разработки!

## 4. Тестирование

1. Откройте приложение
2. Перейдите на экран регистрации
3. Заполните форму:
   - Имя: `Тест`
   - Email: `test@example.com`
   - Возраст: `25`
   - Пароль: `123456`
   - Подтверждение пароля: `123456`
4. Нажмите **Создать аккаунт**

## 5. Проверка результата

После регистрации проверьте:

### В Firebase Console > Authentication > Users:
- Должен появиться пользователь с email `test@example.com`

### В Firebase Console > Firestore Database:
- Должна появиться коллекция `users`
- В ней должен быть документ с ID пользователя
- Документ должен содержать данные: name, age, email, location и т.д.

## 6. Если что-то не работает

Проверьте консоль браузера или Expo Go на наличие ошибок. Обычные проблемы:

- **"Firebase: Error (auth/email-already-in-use)"** - пользователь уже существует
- **"Firebase: Error (auth/weak-password)"** - пароль слишком простой
- **"Firebase: Error (auth/invalid-email)"** - неверный формат email
- **"Firebase: Error (auth/network-request-failed)"** - проблемы с сетью

## 7. Логи для отладки

В консоли должны появиться логи:
```
Начинаем регистрацию пользователя: {email: "test@example.com", name: "Тест", age: 25}
AuthStore: Начинаем регистрацию
AuthStore: Результат регистрации: {user: ..., profile: ..., error: null}
AuthStore: Устанавливаем пользователя в store
Регистрация успешна
```
