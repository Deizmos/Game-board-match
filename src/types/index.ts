// Базовые типы для регистрации
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio?: string;
  avatar?: string;
  location: Location;
  isOnline: boolean;
  lastSeen: any; // Timestamp
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
}
