-- GameBoardMatch Database Schema
-- Выполните этот скрипт в Supabase SQL Editor

-- Включение PostGIS расширения для геопространственных запросов
CREATE EXTENSION IF NOT EXISTS postgis;

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
  category TEXT NOT NULL CHECK (category IN (
    'strategy', 'party', 'cooperative', 'competitive', 
    'family', 'card', 'dice', 'miniature', 'roleplay', 'other'
  )),
  min_players INTEGER NOT NULL CHECK (min_players > 0),
  max_players INTEGER NOT NULL CHECK (max_players > 0),
  play_time INTEGER NOT NULL CHECK (play_time > 0), -- в минутах
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
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  play_styles TEXT[] NOT NULL CHECK (
    array_length(play_styles, 1) > 0 AND
    play_styles <@ ARRAY['casual', 'competitive', 'social', 'strategic', 'creative', 'cooperative']
  ),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Создание таблицы матчей
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2, game_id)
);

-- Создание таблицы сообщений
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_users_location ON users USING GIST (
  ST_Point((location->>'longitude')::DOUBLE PRECISION, (location->>'latitude')::DOUBLE PRECISION)
);

CREATE INDEX idx_users_online ON users(is_online);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_matches_users ON matches(user_id_1, user_id_2);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_user_preferences_user ON user_game_preferences(user_id);

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

-- Функция для обновления времени последней активности
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления last_seen
CREATE TRIGGER trigger_update_user_last_seen
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_preferences_updated_at
  BEFORE UPDATE ON user_game_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Политики для users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для user_game_preferences
CREATE POLICY "Users can view their own preferences" ON user_game_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON user_game_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Политики для matches
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id_1);

CREATE POLICY "Users can update their own matches" ON matches
  FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Политики для messages
CREATE POLICY "Users can view messages in their matches" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

-- Вставка тестовых данных
INSERT INTO games (name, description, category, min_players, max_players, play_time, complexity) VALUES
('Монополия', 'Классическая настольная игра о недвижимости', 'family', 2, 8, 120, 2),
('Каркассон', 'Стратегическая игра с плитками', 'strategy', 2, 5, 45, 3),
('Алиас', 'Словесная игра для вечеринок', 'party', 4, 12, 30, 1),
('Пандемия', 'Кооперативная игра о спасении мира', 'cooperative', 2, 4, 60, 3),
('Манчкин', 'Карточная игра с юмором', 'card', 3, 6, 90, 2),
('Терра Мистика', 'Сложная стратегическая игра', 'strategy', 2, 4, 120, 5),
('Диксит', 'Творческая игра с ассоциациями', 'party', 3, 6, 30, 1),
('Сплэш', 'Быстрая карточная игра', 'card', 2, 6, 15, 2),
('Гномы-вредители', 'Кооперативная игра с саботажем', 'cooperative', 2, 10, 15, 2),
('Колонизаторы', 'Торговая стратегическая игра', 'strategy', 3, 4, 90, 3);
