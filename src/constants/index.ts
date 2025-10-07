export const APP_CONFIG = {
  name: 'GameBoardMatch',
  version: '1.0.0',
  // Firebase конфигурация
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },
} as const;

// Категории игр
export const GAME_CATEGORIES = {
  strategy: 'Стратегические',
  party: 'Партийные',
  cooperative: 'Кооперативные',
  competitive: 'Соревновательные',
  family: 'Семейные',
  card: 'Карточные',
  dice: 'С кубиками',
  miniature: 'Миниатюры',
  rpg: 'Ролевые',
  other: 'Другие'
} as const;

// Уровни навыков
export const SKILL_LEVELS = {
  beginner: 'Новичок',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  expert: 'Эксперт'
} as const;

// Стили игры
export const PLAY_STYLES = {
  casual: 'Казуальный',
  competitive: 'Соревновательный',
  social: 'Социальный',
  strategic: 'Стратегический',
  creative: 'Творческий',
  cooperative: 'Кооперативный'
} as const;

// Популярные игры для выбора
export const POPULAR_GAMES = [
  'Монополия',
  'Каркассон',
  'Сеттлерс',
  'Пандемия',
  'Азбука',
  'Доминион',
  'Семь чудес',
  'Тик-так-бум',
  'Активити',
  'Имаджинариум',
  'Мафия',
  'Уно',
  'Джанга',
  'Скраббл',
  'Клауэдо',
  'Риск',
  'Колонизаторы',
  'Покер',
  'Бридж',
  'Шахматы'
];

// Настройки поиска
export const SEARCH_SETTINGS = {
  MIN_RADIUS: 1,
  MAX_RADIUS: 100,
  DEFAULT_RADIUS: 25,
  MIN_AGE: 18,
  MAX_AGE: 100,
  DEFAULT_AGE_RANGE: { min: 20, max: 50 }
} as const;
