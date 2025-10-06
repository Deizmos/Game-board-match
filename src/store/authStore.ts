import { create } from 'zustand';
import { User } from '@/types';
import { supabase } from '@/services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Получаем данные пользователя из таблицы users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;

        set({
          user: userData as User,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, userData: Partial<User>) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Создаем запись пользователя в таблице users
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name: userData.name || '',
            age: userData.age || 18,
            bio: userData.bio || null,
            avatar: userData.avatar || null,
            location: userData.location || {
              latitude: 0,
              longitude: 0,
            },
            is_online: true,
            last_seen: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        set({
          user: {
            id: data.user.id,
            email,
            name: userData.name || '',
            age: userData.age || 18,
            bio: userData.bio,
            avatar: userData.avatar,
            location: userData.location || {
              latitude: 0,
              longitude: 0,
            },
            gamePreferences: [],
            isOnline: true,
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      set({
        user: { ...user, ...updates },
        isLoading: false,
      });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({
        user: data as User,
        isLoading: false,
      });
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));
