import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '@/constants';

const supabaseUrl = APP_CONFIG.apiUrl;
const supabaseKey = APP_CONFIG.apiKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Отсутствуют переменные окружения Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Типы для базы данных
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          age: number;
          bio: string | null;
          avatar: string | null;
          location: {
            latitude: number;
            longitude: number;
            city?: string;
            country?: string;
          };
          is_online: boolean;
          last_seen: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          age: number;
          bio?: string | null;
          avatar?: string | null;
          location: {
            latitude: number;
            longitude: number;
            city?: string;
            country?: string;
          };
          is_online?: boolean;
          last_seen: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          age?: number;
          bio?: string | null;
          avatar?: string | null;
          location?: {
            latitude: number;
            longitude: number;
            city?: string;
            country?: string;
          };
          is_online?: boolean;
          last_seen?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          min_players: number;
          max_players: number;
          play_time: number;
          complexity: number;
          image_url: string | null;
          bgg_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          min_players: number;
          max_players: number;
          play_time: number;
          complexity: number;
          image_url?: string | null;
          bgg_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          min_players?: number;
          max_players?: number;
          play_time?: number;
          complexity?: number;
          image_url?: string | null;
          bgg_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_game_preferences: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          skill_level: string;
          play_styles: string[];
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          skill_level: string;
          play_styles: string[];
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          skill_level?: string;
          play_styles?: string[];
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_id_1: string;
          user_id_2: string;
          game_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id_1: string;
          user_id_2: string;
          game_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id_1?: string;
          user_id_2?: string;
          game_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          timestamp: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          timestamp?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          content?: string;
          timestamp?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
