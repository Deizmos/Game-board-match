export const GAME_CATEGORIES = [
  { value: 'strategy', label: 'Стратегические' },
  { value: 'party', label: 'Партийные' },
  { value: 'cooperative', label: 'Кооперативные' },
  { value: 'competitive', label: 'Соревновательные' },
  { value: 'family', label: 'Семейные' },
  { value: 'card', label: 'Карточные' },
  { value: 'dice', label: 'С кубиками' },
  { value: 'miniature', label: 'Миниатюры' },
  { value: 'roleplay', label: 'Ролевые' },
  { value: 'other', label: 'Другие' },
] as const;

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Новичок' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
  { value: 'expert', label: 'Эксперт' },
] as const;

export const PLAY_STYLES = [
  { value: 'casual', label: 'Казуальный' },
  { value: 'competitive', label: 'Соревновательный' },
  { value: 'social', label: 'Социальный' },
  { value: 'strategic', label: 'Стратегический' },
  { value: 'creative', label: 'Творческий' },
  { value: 'cooperative', label: 'Кооперативный' },
] as const;

export const APP_CONFIG = {
  name: 'GameBoardMatch',
  version: '1.0.0',
  apiUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  apiKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

export const LOCATION_CONFIG = {
  defaultRadius: 50, // километров
  maxRadius: 200,
  updateInterval: 30000, // 30 секунд
} as const;

export const MATCH_CONFIG = {
  maxDistance: 100, // километров
  minAge: 18,
  maxAge: 100,
} as const;
