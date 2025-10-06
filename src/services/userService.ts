import { supabase, Database } from './supabase';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface FindUsersParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  minAge?: number;
  maxAge?: number;
  onlineOnly?: boolean;
}

export class UserService {
  /**
   * Получение профиля текущего пользователя
   */
  static async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        return { user: null, error: authError || new Error('Пользователь не авторизован') };
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      return { user, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Создание профиля пользователя
   */
  static async createProfile(profileData: UserInsert): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      return { user, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateProfile(
    userId: string,
    updates: UserUpdate
  ): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { user, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Поиск пользователей в радиусе
   */
  static async findUsersInRadius(params: FindUsersParams): Promise<{ users: User[]; error: Error | null }> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        return { users: [], error: new Error('Пользователь не авторизован') };
      }

      const { data: users, error } = await supabase.rpc('find_users_in_radius', {
        user_lat: params.latitude,
        user_lng: params.longitude,
        radius_km: params.radiusKm,
        min_age: params.minAge || 18,
        max_age: params.maxAge || 100,
        online_only: params.onlineOnly || false,
        current_user_id: currentUser.id,
      });

      return { users: users || [], error };
    } catch (error) {
      return { users: [], error: error as Error };
    }
  }

  /**
   * Обновление статуса онлайн
   */
  static async updateOnlineStatus(isOnline: boolean): Promise<{ error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: new Error('Пользователь не авторизован') };
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Обновление местоположения пользователя
   */
  static async updateLocation(
    userId: string,
    location: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ location })
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Получение пользователя по ID
   */
  static async getUserById(userId: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return { user, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Поиск пользователей по имени
   */
  static async searchUsersByName(query: string): Promise<{ users: User[]; error: Error | null }> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);

      return { users: users || [], error };
    } catch (error) {
      return { users: [], error: error as Error };
    }
  }

  /**
   * Удаление профиля пользователя
   */
  static async deleteProfile(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
