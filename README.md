# GameBoardMatch

Приложение для знакомств по настольным играм с геолокацией, построенное на React Native + Expo.

## 🎯 Описание

GameBoardMatch - это мобильное приложение, которое помогает людям находить партнеров для настольных игр на основе их предпочтений в играх и географического местоположения. Пользователи могут создавать профили, указывать свои любимые игры и стиль игры, а затем находить других игроков поблизости.

## 🚀 Технологии

- **Frontend**: React Native + Expo
- **TypeScript**: Для типизации
- **UI**: Tamagui
- **Навигация**: Expo Router
- **Состояние**: Zustand
- **Серверные запросы**: TanStack Query
- **Backend**: Supabase
- **Геолокация**: Expo Location
- **Карты**: React Native Maps
- **Формы**: React Hook Form + Zod

## 📱 Функциональность

### Основные возможности:
- 🔐 Аутентификация пользователей
- 📍 Поиск игроков по геолокации
- 🎲 Настройка предпочтений в играх
- 💬 Система матчей и сообщений
- 🗺️ Карта с отображением игроков
- 👤 Профиль пользователя

### Экраны:
- **Авторизация**: Вход и регистрация
- **Онбординг**: Настройка предпочтений
- **Поиск**: Карточки игроков с возможностью лайка/пасса
- **Матчи**: Список принятых матчей
- **Сообщения**: Чат с матчами
- **Профиль**: Настройки пользователя

## 🛠️ Установка и запуск

### Предварительные требования:
- Node.js 18+
- npm или yarn
- Expo CLI
- iOS Simulator (для iOS) или Android Studio (для Android)

### 1. Клонирование и установка зависимостей:
```bash
git clone <repository-url>
cd game-board-match
npm install
```

### 2. Настройка Supabase:
1. Создайте проект в [Supabase](https://supabase.com)
2. Скопируйте `env.example` в `.env`:
```bash
cp env.example .env
```
3. Заполните переменные окружения в `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Настройка базы данных:
Выполните SQL скрипты для создания таблиц в Supabase:

```sql
-- Создание таблицы пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  bio TEXT,
  avatar TEXT,
  location JSONB NOT NULL,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы игр
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  min_players INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  play_time INTEGER NOT NULL, -- в минутах
  complexity INTEGER CHECK (complexity >= 1 AND complexity <= 5),
  image_url TEXT,
  bgg_id TEXT, -- BoardGameGeek ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы предпочтений пользователей
CREATE TABLE user_game_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  skill_level TEXT NOT NULL,
  play_styles TEXT[] NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы матчей
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы сообщений
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Функция для поиска пользователей в радиусе
CREATE OR REPLACE FUNCTION find_users_in_radius(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  min_age INTEGER,
  max_age INTEGER,
  online_only BOOLEAN,
  current_user_id UUID
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  age INTEGER,
  bio TEXT,
  avatar TEXT,
  location JSONB,
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.age,
    u.bio,
    u.avatar,
    u.location,
    u.is_online,
    u.last_seen,
    u.created_at,
    u.updated_at,
    ST_Distance(
      ST_Point(user_lng, user_lat)::geography,
      ST_Point((u.location->>'longitude')::DOUBLE PRECISION, (u.location->>'latitude')::DOUBLE PRECISION)::geography
    ) / 1000 AS distance_km
  FROM users u
  WHERE u.id != current_user_id
    AND u.age >= min_age
    AND u.age <= max_age
    AND (NOT online_only OR u.is_online = true)
    AND ST_DWithin(
      ST_Point(user_lng, user_lat)::geography,
      ST_Point((u.location->>'longitude')::DOUBLE PRECISION, (u.location->>'latitude')::DOUBLE PRECISION)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Включение PostGIS расширения
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 4. Запуск приложения:
```bash
# Запуск в режиме разработки
npm start

# Запуск на iOS
npm run ios

# Запуск на Android
npm run android

# Запуск в веб-браузере
npm run web
```

## 📁 Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── MapView.tsx
│   ├── LocationPermission.tsx
│   ├── UserCard.tsx
│   └── GamePreferenceSelector.tsx
├── screens/            # Экраны приложения
├── navigation/         # Настройки навигации
├── services/           # API сервисы
│   ├── supabase.ts
│   └── api.ts
├── store/              # Управление состоянием
│   ├── authStore.ts
│   └── locationStore.ts
├── types/              # TypeScript типы
│   └── index.ts
├── utils/              # Утилиты
├── hooks/              # Кастомные хуки
└── constants/          # Константы
    └── index.ts

app/                    # Expo Router структура
├── (auth)/            # Экраны авторизации
│   ├── login.tsx
│   ├── register.tsx
│   └── onboarding.tsx
├── (tabs)/            # Основные табы
│   ├── index.tsx      # Поиск
│   ├── matches.tsx    # Матчи
│   ├── messages.tsx   # Сообщения
│   └── profile.tsx    # Профиль
└── _layout.tsx        # Корневой layout
```

## 🔧 Настройка

### Переменные окружения:
- `EXPO_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Анонимный ключ Supabase

### Разрешения:
Приложение запрашивает следующие разрешения:
- **Геолокация**: Для поиска игроков поблизости
- **Камера**: Для загрузки фото профиля
- **Уведомления**: Для push-уведомлений о матчах

## 🚀 Развертывание

### Expo Build:
```bash
# Создание production build
expo build:android
expo build:ios

# Или с EAS Build
eas build --platform all
```

### App Store / Google Play:
1. Настройте подписи приложения
2. Загрузите build в соответствующие магазины
3. Настройте метаданные и скриншоты

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории или свяжитесь с командой разработки.

---

**Приятной игры! 🎲**
