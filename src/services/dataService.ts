// Экспорт всех сервисов из отдельных файлов
export { AuthService } from './authService';
export { UserService } from './userService';
export { GameService } from './gameService';
export { MatchService } from './matchService';
export { MessageService } from './messageService';

// Экспорт типов
export type { SignUpData, AuthResult } from './authService';
export type { User, UserInsert, UserUpdate, FindUsersParams } from './userService';
export type { Game, GameInsert, GameUpdate, GameFilters } from './gameService';
export type { Match, MatchInsert, MatchUpdate, MatchStatus, MatchWithDetails } from './matchService';
export type { Message, MessageInsert, MessageUpdate, MessageWithSender } from './messageService';