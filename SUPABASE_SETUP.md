# Подключение Supabase к GameBoardMatch

## Быстрый старт

### 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com) и создайте аккаунт
2. Нажмите "New Project"
3. Выберите организацию и введите название проекта
4. Выберите регион (рекомендую ближайший к вашим пользователям)
5. Установите пароль для базы данных
6. Нажмите "Create new project"

### 2. Получение ключей API

После создания проекта:

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://your-project.supabase.co`)
   - **anon public** ключ

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp env.example .env
```

Отредактируйте `.env` файл и замените значения на ваши реальные ключи:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_DEBUG=true
```

### 4. Настройка базы данных

1. Перейдите в **SQL Editor** в панели Supabase
2. Скопируйте содержимое файла `database/schema.sql`
3. Вставьте и выполните скрипт

Это создаст:
- ✅ Все необходимые таблицы (users, games, matches, messages, user_game_preferences)
- ✅ Индексы для оптимизации запросов
- ✅ Row Level Security политики
- ✅ Функции для поиска пользователей в радиусе
- ✅ Тестовые данные игр

### 5. Настройка аутентификации

В Supabase перейдите в **Authentication** → **Settings**:

1. **Site URL**: `exp://localhost:8081` (для разработки)
2. **Redirect URLs**: добавьте:
   - `exp://localhost:8081`
   - `exp://192.168.1.100:8081` (ваш локальный IP)
   - Для продакшена: `https://your-app-domain.com`

### 6. Тестирование подключения

Добавьте компонент `SupabaseTestComponent` в ваш экран для тестирования:

```tsx
import { SupabaseTestComponent } from '@/components/SupabaseTestComponent';

export default function TestScreen() {
  return <SupabaseTestComponent />;
}
```

## Структура сервисов

### AuthService
- `signUp()` - регистрация пользователя
- `signIn()` - вход в систему
- `signOut()` - выход из системы
- `getCurrentSession()` - получение текущей сессии

### UserService
- `getCurrentUser()` - получение профиля текущего пользователя
- `createProfile()` - создание профиля пользователя
- `updateProfile()` - обновление профиля
- `findUsersInRadius()` - поиск пользователей в радиусе
- `updateOnlineStatus()` - обновление статуса онлайн

### GameService
- `getAllGames()` - получение всех игр
- `getGamesByCategory()` - получение игр по категории
- `searchGames()` - поиск игр по названию

### MatchService
- `createMatch()` - создание матча
- `getUserMatches()` - получение матчей пользователя
- `updateMatchStatus()` - обновление статуса матча

### MessageService
- `sendMessage()` - отправка сообщения
- `getMatchMessages()` - получение сообщений матча
- `markMessagesAsRead()` - отметка сообщений как прочитанных

## Использование в компонентах

```tsx
import { AuthService, UserService, GameService } from '@/services/dataService';

// Регистрация
const handleSignUp = async () => {
  const { user, profile, error } = await AuthService.signUp(
    email, 
    password, 
    { name: 'Имя', age: 25 }
  );
};

// Поиск пользователей
const findUsers = async () => {
  const users = await UserService.findUsersInRadius(
    latitude, 
    longitude, 
    50, // радиус в км
    18, // минимальный возраст
    100, // максимальный возраст
    true // только онлайн
  );
};

// Получение игр
const loadGames = async () => {
  const games = await GameService.getAllGames();
};
```

## Безопасность

- ✅ Row Level Security (RLS) включен для всех таблиц
- ✅ Политики безопасности настроены
- ✅ Пользователи могут видеть только свои данные
- ✅ Матчи видны только участникам
- ✅ Сообщения доступны только участникам матча

## Мониторинг

Используйте Supabase Dashboard для:
- Просмотра логов в реальном времени
- Мониторинга производительности
- Управления пользователями
- Просмотра метрик API

## Troubleshooting

### Проблемы с подключением
1. Проверьте правильность URL и ключей в `.env`
2. Убедитесь, что проект Supabase активен
3. Проверьте интернет соединение

### Проблемы с аутентификацией
1. Проверьте настройки Site URL и Redirect URLs
2. Убедитесь, что email подтвержден (если требуется)
3. Проверьте логи в Supabase Dashboard

### Проблемы с базой данных
1. Убедитесь, что SQL схема выполнена полностью
2. Проверьте RLS политики
3. Проверьте права доступа пользователей

## Дополнительные ресурсы

- [Документация Supabase](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
