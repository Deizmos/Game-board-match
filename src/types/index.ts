export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio?: string;
  avatar?: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  gamePreferences: GamePreference[];
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface GamePreference {
  id: string;
  gameId: string;
  gameName: string;
  gameCategory: GameCategory;
  skillLevel: SkillLevel;
  playStyle: PlayStyle[];
  isFavorite: boolean;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  playTime: number; // в минутах
  complexity: number; // 1-5
  imageUrl?: string;
  bggId?: string; // BoardGameGeek ID
}

export type GameCategory = 
  | 'strategy'
  | 'party'
  | 'cooperative'
  | 'competitive'
  | 'family'
  | 'card'
  | 'dice'
  | 'miniature'
  | 'roleplay'
  | 'other';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type PlayStyle = 
  | 'casual'
  | 'competitive'
  | 'social'
  | 'strategic'
  | 'creative'
  | 'cooperative';

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  gameId: string;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface SearchFilters {
  ageRange: [number, number];
  maxDistance: number; // в километрах
  gameCategories: GameCategory[];
  skillLevels: SkillLevel[];
  playStyles: PlayStyle[];
  onlineOnly: boolean;
}
