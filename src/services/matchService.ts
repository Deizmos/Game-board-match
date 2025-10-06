import { supabase, Database } from './supabase';

export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface MatchWithDetails extends Match {
  user_1: Database['public']['Tables']['users']['Row'];
  user_2: Database['public']['Tables']['users']['Row'];
  game: Database['public']['Tables']['games']['Row'];
}

export class MatchService {
  /**
   * Создание нового матча
   */
  static async createMatch(
    userId1: string,
    userId2: string,
    gameId: string
  ): Promise<{ match: Match | null; error: Error | null }> {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          user_id_1: userId1,
          user_id_2: userId2,
          game_id: gameId,
          status: 'pending',
        })
        .select()
        .single();

      return { match, error };
    } catch (error) {
      return { match: null, error: error as Error };
    }
  }

  /**
   * Получение матчей пользователя
   */
  static async getUserMatches(userId: string): Promise<{ matches: MatchWithDetails[]; error: Error | null }> {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_1:users!matches_user_id_1_fkey(*),
          user_2:users!matches_user_id_2_fkey(*),
          game:games(*)
        `)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .order('created_at', { ascending: false });

      return { matches: matches || [], error };
    } catch (error) {
      return { matches: [], error: error as Error };
    }
  }

  /**
   * Получение матча по ID
   */
  static async getMatchById(matchId: string): Promise<{ match: MatchWithDetails | null; error: Error | null }> {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_1:users!matches_user_id_1_fkey(*),
          user_2:users!matches_user_id_2_fkey(*),
          game:games(*)
        `)
        .eq('id', matchId)
        .single();

      return { match, error };
    } catch (error) {
      return { match: null, error: error as Error };
    }
  }

  /**
   * Обновление статуса матча
   */
  static async updateMatchStatus(
    matchId: string,
    status: MatchStatus
  ): Promise<{ match: Match | null; error: Error | null }> {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

      return { match, error };
    } catch (error) {
      return { match: null, error: error as Error };
    }
  }

  /**
   * Принятие матча
   */
  static async acceptMatch(matchId: string): Promise<{ match: Match | null; error: Error | null }> {
    return this.updateMatchStatus(matchId, 'accepted');
  }

  /**
   * Отклонение матча
   */
  static async declineMatch(matchId: string): Promise<{ match: Match | null; error: Error | null }> {
    return this.updateMatchStatus(matchId, 'declined');
  }

  /**
   * Получение активных матчей пользователя
   */
  static async getActiveMatches(userId: string): Promise<{ matches: MatchWithDetails[]; error: Error | null }> {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_1:users!matches_user_id_1_fkey(*),
          user_2:users!matches_user_id_2_fkey(*),
          game:games(*)
        `)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      return { matches: matches || [], error };
    } catch (error) {
      return { matches: [], error: error as Error };
    }
  }

  /**
   * Получение входящих матчей (где пользователь - получатель)
   */
  static async getIncomingMatches(userId: string): Promise<{ matches: MatchWithDetails[]; error: Error | null }> {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_1:users!matches_user_id_1_fkey(*),
          user_2:users!matches_user_id_2_fkey(*),
          game:games(*)
        `)
        .eq('user_id_2', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      return { matches: matches || [], error };
    } catch (error) {
      return { matches: [], error: error as Error };
    }
  }

  /**
   * Получение исходящих матчей (где пользователь - инициатор)
   */
  static async getOutgoingMatches(userId: string): Promise<{ matches: MatchWithDetails[]; error: Error | null }> {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_1:users!matches_user_id_1_fkey(*),
          user_2:users!matches_user_id_2_fkey(*),
          game:games(*)
        `)
        .eq('user_id_1', userId)
        .order('created_at', { ascending: false });

      return { matches: matches || [], error };
    } catch (error) {
      return { matches: [], error: error as Error };
    }
  }

  /**
   * Проверка существования матча между пользователями
   */
  static async checkExistingMatch(
    userId1: string,
    userId2: string,
    gameId: string
  ): Promise<{ exists: boolean; match: Match | null; error: Error | null }> {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user_id_1.eq.${userId1},user_id_2.eq.${userId2},game_id.eq.${gameId}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1},game_id.eq.${gameId})`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { exists: false, match: null, error };
      }

      return { exists: !!match, match, error: null };
    } catch (error) {
      return { exists: false, match: null, error: error as Error };
    }
  }

  /**
   * Удаление матча
   */
  static async deleteMatch(matchId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Получение статистики матчей пользователя
   */
  static async getMatchStats(userId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    error: Error | null;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('matches')
        .select('status')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

      if (error) {
        return { total: 0, pending: 0, accepted: 0, declined: 0, error };
      }

      const total = stats?.length || 0;
      const pending = stats?.filter(m => m.status === 'pending').length || 0;
      const accepted = stats?.filter(m => m.status === 'accepted').length || 0;
      const declined = stats?.filter(m => m.status === 'declined').length || 0;

      return { total, pending, accepted, declined, error: null };
    } catch (error) {
      return { total: 0, pending: 0, accepted: 0, declined: 0, error: error as Error };
    }
  }
}
