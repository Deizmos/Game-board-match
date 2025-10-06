import { supabase, Database } from './supabase';
import { User } from '@supabase/supabase-js';

export interface SignUpData {
  name: string;
  age: number;
  bio?: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

export interface AuthResult {
  user: User | null;
  profile: Database['public']['Tables']['users']['Row'] | null;
  error: Error | null;
}

export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  static async signUp(
    email: string,
    password: string,
    profileData: SignUpData
  ): Promise<AuthResult> {
    try {
      // Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { user: null, profile: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, profile: null, error: new Error('Пользователь не создан') };
      }

      // Создание профиля пользователя
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: profileData.name,
          age: profileData.age,
          bio: profileData.bio,
          location: profileData.location,
        })
        .select()
        .single();

      if (profileError) {
        return { user: authData.user, profile: null, error: profileError };
      }

      return { user: authData.user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
    }
  }

  /**
   * Вход в систему
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, profile: null, error };
      }

      if (!data.user) {
        return { user: null, profile: null, error: new Error('Пользователь не найден') };
      }

      // Получение профиля пользователя
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { user: data.user, profile: null, error: profileError };
      }

      return { user: data.user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
    }
  }

  /**
   * Выход из системы
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Получение текущей сессии
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  /**
   * Получение текущего пользователя
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Сброс пароля
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'exp://localhost:8081/reset-password',
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Обновление пароля
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
