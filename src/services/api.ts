import { supabase } from './supabase';
import { User, Game, Match, Message, SearchFilters, GamePreference } from '@/types';

export class ApiService {
  // Пользователи
  static async getUsers(filters: SearchFilters, currentUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_game_preferences (
          *,
          games (*)
        )
      `)
      .neq('id', currentUserId)
      .gte('age', filters.ageRange[0])
      .lte('age', filters.ageRange[1])
      .eq('is_online', filters.onlineOnly);

    if (error) throw error;
    return data;
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_game_preferences (
          *,
          games (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Игры
  static async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  static async getGameById(id: string) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async searchGames(query: string) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;
    return data;
  }

  // Предпочтения игр
  static async getUserGamePreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_game_preferences')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  static async addGamePreference(userId: string, gameId: string, skillLevel: string, playStyles: string[]) {
    const { data, error } = await supabase
      .from('user_game_preferences')
      .insert({
        user_id: userId,
        game_id: gameId,
        skill_level: skillLevel,
        play_styles: playStyles,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateGamePreference(id: string, updates: Partial<GamePreference>) {
    const { data, error } = await supabase
      .from('user_game_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeGamePreference(id: string) {
    const { error } = await supabase
      .from('user_game_preferences')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Матчи
  static async getMatches(userId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:users!matches_user_id_1_fkey (*),
        user2:users!matches_user_id_2_fkey (*),
        games (*)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createMatch(userId1: string, userId2: string, gameId: string) {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        user_id_1: userId1,
        user_id_2: userId2,
        game_id: gameId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMatchStatus(matchId: string, status: string) {
    const { data, error } = await supabase
      .from('matches')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Сообщения
  static async getMessages(matchId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (*)
      `)
      .eq('match_id', matchId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async sendMessage(matchId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async markMessagesAsRead(matchId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId);

    if (error) throw error;
  }

  // Поиск пользователей по геолокации
  static async findNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm: number,
    filters: SearchFilters,
    currentUserId: string
  ) {
    // Используем PostGIS функцию для поиска пользователей в радиусе
    const { data, error } = await supabase.rpc('find_users_in_radius', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radiusKm,
      min_age: filters.ageRange[0],
      max_age: filters.ageRange[1],
      online_only: filters.onlineOnly,
      current_user_id: currentUserId,
    });

    if (error) throw error;
    return data;
  }
}
