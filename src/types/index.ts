// Базовые типы для регистрации
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Типы для игр и предпочтений
export type GameCategory = 
  | 'strategy' | 'party' | 'cooperative' | 'competitive' 
  | 'family' | 'card' | 'dice' | 'miniature' | 'rpg' | 'other';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type PlayStyle = 'casual' | 'competitive' | 'social' | 'strategic' | 'creative' | 'cooperative';

export interface GamePreference {
  category: GameCategory;
  skillLevel: SkillLevel;
  playStyle: PlayStyle;
  favoriteGames: string[];
}

export interface OnboardingData {
  gamePreferences: GamePreference[];
  bio: string;
  avatar?: string;
  searchRadius: number; // км
  ageRange: { min: number; max: number };
  location: Location;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio?: string;
  avatar?: string;
  location: Location;
  gamePreferences?: GamePreference[];
  searchRadius?: number;
  ageRange?: { min: number; max: number };
  isOnline: boolean;
  lastSeen: any; // Timestamp
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
}

// Типы для матчинга
export interface Match {
  id: string;
  users: [string, string]; // ID пользователей
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  acceptedAt?: Date;
  gamePreferences?: {
    commonGames: string[];
    compatibility: number; // 0-100%
  };
}

// Типы для сообщений
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'game_invite' | 'meeting_plan';
  createdAt: Date;
  readAt?: Date;
}
