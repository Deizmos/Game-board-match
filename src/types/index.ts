import { Request } from 'express';
import { Document } from 'mongoose';

// Base interfaces
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city: string;
  country: string;
}

export interface IGameImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface IGameRating {
  average: number;
  count: number;
}

export interface IAgeRange {
  min: number;
  max: number;
}

export interface IPlayingTime {
  min: number;
  max: number;
}

export interface IAvailability {
  weekdays: string[];
  weekends: string[];
  timeSlots: string[];
}

export interface IUserPreferences {
  maxDistance: number;
  ageRange: IAgeRange;
  gameTypes: string[];
  playStyle: 'casual' | 'competitive' | 'mixed';
  availability: IAvailability;
}

export interface IPlayer {
  user: string;
  joinedAt: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface IChatMessage {
  user: string;
  message: string;
  timestamp: Date;
}

export interface IMatchRequirements {
  experience: 'beginner' | 'intermediate' | 'advanced' | 'any';
  ageMin: number;
  notes?: string;
}

export interface IMatchLocation {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  venue: string;
  city: string;
}

// User interfaces
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  bio: string;
  avatar: string;
  location: ILocation;
  preferences: IUserPreferences;
  favoriteGames: string[];
  isActive: boolean;
  lastSeen: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  fullName: string;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

// Game interfaces
export interface IGame extends Document {
  _id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  playingTime: IPlayingTime;
  age: IAgeRange;
  categories: string[];
  mechanics: string[];
  complexity: number;
  rating: IGameRating;
  images: IGameImage[];
  publisher: string;
  yearPublished: number;
  bggId?: number;
  isActive: boolean;
  tags: string[];
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  averageRating: number;
  
  // Methods
  updateRating(newRating: number): Promise<IGame>;
  supportsPlayerCount(playerCount: number): boolean;
  suitableForAge(age: number): boolean;
}

// Match interfaces
export interface IMatch extends Document {
  _id: string;
  host: string;
  game: string;
  title: string;
  description: string;
  location: IMatchLocation;
  scheduledDate: Date;
  duration: number;
  maxPlayers: number;
  currentPlayers: IPlayer[];
  status: 'open' | 'full' | 'in-progress' | 'completed' | 'cancelled';
  requirements: IMatchRequirements;
  chat: IChatMessage[];
  tags: string[];
  isPublic: boolean;
  visibility: 'public' | 'friends' | 'private';
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  availableSpots: number;
  isFull: boolean;
  
  // Methods
  addPlayer(userId: string): Promise<IMatch>;
  removePlayer(userId: string): Promise<IMatch>;
  hasPlayer(userId: string): boolean;
  getDistanceFrom(coordinates: [number, number]): number;
}

// Request interfaces
export interface AuthRequest extends Request {
  user?: IUser;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
  stack?: string;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    [key: string]: T[];
    pagination: PaginationInfo;
  };
}

// JWT Payload
export interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Validation schemas
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  bio?: string;
  location: ILocation;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  age?: number;
  location?: ILocation;
  preferences?: Partial<IUserPreferences>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateGameData {
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  playingTime: IPlayingTime;
  age: IAgeRange;
  categories?: string[];
  mechanics?: string[];
  complexity: number;
  publisher: string;
  yearPublished: number;
  bggId?: number;
}

export interface UpdateGameData {
  name?: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: IPlayingTime;
  age?: IAgeRange;
  categories?: string[];
  mechanics?: string[];
  complexity?: number;
  publisher?: string;
  yearPublished?: number;
  bggId?: number;
}

export interface RateGameData {
  rating: number;
}

export interface CreateMatchData {
  game: string;
  title: string;
  description?: string;
  location: IMatchLocation;
  scheduledDate: Date;
  duration: number;
  maxPlayers: number;
  requirements?: IMatchRequirements;
  tags?: string[];
  isPublic?: boolean;
  visibility?: 'public' | 'friends' | 'private';
}

export interface UpdateMatchData {
  title?: string;
  description?: string;
  location?: IMatchLocation;
  scheduledDate?: Date;
  duration?: number;
  maxPlayers?: number;
  requirements?: IMatchRequirements;
  tags?: string[];
  isPublic?: boolean;
  visibility?: 'public' | 'friends' | 'private';
}

// Search and filter interfaces
export interface UserSearchParams {
  query?: string;
  gameTypes?: string;
  playStyle?: string;
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
}

export interface GameSearchParams {
  search?: string;
  categories?: string;
  mechanics?: string;
  minPlayers?: number;
  maxPlayers?: number;
  complexity?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MatchSearchParams {
  game?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  dateFrom?: string;
  dateTo?: string;
  maxPlayers?: number;
  experience?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface NearbyUsersParams {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  limit?: number;
}

// Error types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Environment variables
export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: number;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}
