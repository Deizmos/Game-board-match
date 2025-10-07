import { create } from 'zustand';
import { User } from '@/types';
import { FirebaseAuthService } from '@/services/firebaseAuthService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, profile, error } = await FirebaseAuthService.signIn(email, password);

      if (error) throw error;

      if (user && profile) {
        set({
          user: profile as User,
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
    console.log('AuthStore: Начинаем регистрацию');
    set({ isLoading: true });
    try {
      const { user, profile, error } = await FirebaseAuthService.signUp(
        email,
        password,
        {
          name: userData.name || '',
          age: userData.age || 18,
          bio: userData.bio,
          location: userData.location || {
            latitude: 0,
            longitude: 0,
          },
        }
      );

      console.log('AuthStore: Результат регистрации:', { user, profile, error });

      if (error) throw error;

      if (user && profile) {
        console.log('AuthStore: Устанавливаем пользователя в store');
        set({
          user: profile as User,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('AuthStore: Ошибка регистрации:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));
