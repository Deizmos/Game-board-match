import { supabase, Database } from './supabase';

export type Game = Database['public']['Tables']['games']['Row'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GameUpdate = Database['public']['Tables']['games']['Update'];

export interface GameFilters {
  category?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  minComplexity?: number;
  maxComplexity?: number;
  searchQuery?: string;
}

export class GameService {
  /**
   * Получение всех игр
   */
  static async getAllGames(): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('name');

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }

  /**
   * Получение игр по категории
   */
  static async getGamesByCategory(category: string): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('category', category)
        .order('name');

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }

  /**
   * Поиск игр по названию
   */
  static async searchGames(query: string): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }

  /**
   * Получение игры по ID
   */
  static async getGameById(gameId: string): Promise<{ game: Game | null; error: Error | null }> {
    try {
      const { data: game, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      return { game, error };
    } catch (error) {
      return { game: null, error: error as Error };
    }
  }

  /**
   * Фильтрация игр по параметрам
   */
  static async getFilteredGames(filters: GameFilters): Promise<{ games: Game[]; error: Error | null }> {
    try {
      let query = supabase.from('games').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.minPlayers) {
        query = query.gte('min_players', filters.minPlayers);
      }

      if (filters.maxPlayers) {
        query = query.lte('max_players', filters.maxPlayers);
      }

      if (filters.minPlayTime) {
        query = query.gte('play_time', filters.minPlayTime);
      }

      if (filters.maxPlayTime) {
        query = query.lte('play_time', filters.maxPlayTime);
      }

      if (filters.minComplexity) {
        query = query.gte('complexity', filters.minComplexity);
      }

      if (filters.maxComplexity) {
        query = query.lte('complexity', filters.maxComplexity);
      }

      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      const { data: games, error } = await query.order('name');

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }

  /**
   * Получение популярных игр (по количеству предпочтений)
   */
  static async getPopularGames(limit: number = 10): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          *,
          user_game_preferences(count)
        `)
        .order('user_game_preferences.count', { ascending: false })
        .limit(limit);

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }

  /**
   * Получение случайных игр
   */
  static async getRandomGames(limit: number = 5): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('random()')
        .limit(limit);

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }

  /**
   * Создание новой игры (для админов)
   */
  static async createGame(gameData: GameInsert): Promise<{ game: Game | null; error: Error | null }> {
    try {
      const { data: game, error } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single();

      return { game, error };
    } catch (error) {
      return { game: null, error: error as Error };
    }
  }

  /**
   * Обновление игры
   */
  static async updateGame(
    gameId: string,
    updates: GameUpdate
  ): Promise<{ game: Game | null; error: Error | null }> {
    try {
      const { data: game, error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', gameId)
        .select()
        .single();

      return { game, error };
    } catch (error) {
      return { game: null, error: error as Error };
    }
  }

  /**
   * Удаление игры
   */
  static async deleteGame(gameId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Получение игр по ID списка
   */
  static async getGamesByIds(gameIds: string[]): Promise<{ games: Game[]; error: Error | null }> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .in('id', gameIds)
        .order('name');

      return { games: games || [], error };
    } catch (error) {
      return { games: [], error: error as Error };
    }
  }
}
