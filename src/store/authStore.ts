import { create } from 'zustand';
import { User, OnboardingData } from '@/types';
import { FirebaseAuthService } from '@/services/firebaseAuthService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  updateUserProfile: (onboardingData: OnboardingData) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  needsOnboarding: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, profile, error } = await FirebaseAuthService.signIn(email, password);

      if (error) throw error;

      if (user && profile) {
        const userProfile = profile as User;
        const needsOnboarding = !userProfile.gamePreferences || userProfile.gamePreferences.length === 0;
        
        set({
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          needsOnboarding,
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
          needsOnboarding: true, // Новый пользователь всегда нуждается в онбординге
        });
      }
    } catch (error) {
      console.error('AuthStore: Ошибка регистрации:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateUserProfile: async (onboardingData: OnboardingData) => {
    set({ isLoading: true });
    try {
      const { user } = get();
      if (!user) throw new Error('Пользователь не найден');

      const updatedUser: User = {
        ...user,
        ...onboardingData,
        gamePreferences: onboardingData.gamePreferences,
        bio: onboardingData.bio,
        searchRadius: onboardingData.searchRadius,
        ageRange: onboardingData.ageRange,
        location: onboardingData.location,
        updatedAt: new Date(),
      };

      // Обновляем профиль в Firebase
      const { error } = await FirebaseAuthService.updateUserProfile(user.id, updatedUser);
      if (error) throw error;

      set({
        user: updatedUser,
        isLoading: false,
        needsOnboarding: false,
      });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await FirebaseAuthService.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsOnboarding: false,
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));
