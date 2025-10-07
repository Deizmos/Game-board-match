import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User as UserProfile } from '@/types';

export interface UserInsert {
  email: string;
  name: string;
  age: number;
  bio?: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  isOnline: boolean;
  lastSeen: any;
  createdAt: any;
  updatedAt: any;
}

export interface AuthResult {
  user: any | null;
  profile: UserProfile | null;
  error: Error | null;
}

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

export class FirebaseAuthService {
  /**
   * Проверка, работает ли Firebase в демо-режиме
   */
  private static isDemoMode(): boolean {
    return process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'demo-api-key' || 
           process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here' || 
           !process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  }

  /**
   * Регистрация нового пользователя
   */
  static async signUp(
    email: string,
    password: string,
    profileData: SignUpData
  ): Promise<AuthResult> {
    if (this.isDemoMode()) {
      // Демо-режим: возвращаем моковые данные
      const mockUser = {
        uid: 'demo-user-id',
        email: email,
        emailVerified: false,
      } as any;
      
      const mockProfile = {
        id: 'demo-user-id',
        email: email,
        name: profileData.name,
        age: profileData.age,
        bio: profileData.bio,
        location: profileData.location,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserProfile;

      return { user: mockUser, profile: mockProfile, error: null };
    }

    try {
      // Регистрация в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Отправка email для верификации
      await sendEmailVerification(user);

      // Создание профиля пользователя в Firestore
      const userProfile: UserInsert = {
        email: user.email!,
        name: profileData.name,
        age: profileData.age,
        bio: profileData.bio,
        location: profileData.location,
        isOnline: true,
        lastSeen: new Date() as any, // Будет конвертировано в Timestamp
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Получение созданного профиля
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = profileDoc.exists() ? { id: user.uid, ...profileDoc.data() } as UserProfile : null;

      return { user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
    }
  }

  /**
   * Вход в систему
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Обновление статуса онлайн
      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      });

      // Получение профиля пользователя
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = profileDoc.exists() ? { id: user.uid, ...profileDoc.data() } as UserProfile : null;

      return { user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
    }
  }

  /**
   * Выход из системы
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Обновление статуса офлайн
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: new Date(),
          updatedAt: new Date(),
        });
      }

      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Получение текущей сессии
   */
  static async getCurrentSession() {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve({ session: user, error: null });
        });
      });
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  /**
   * Получение текущего пользователя
   */
  static async getCurrentUser() {
    try {
      const user = auth.currentUser;
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Сброс пароля
   */
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Обновление пароля
   */
  static async updatePassword(newPassword: string) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { error: new Error('Пользователь не авторизован') };
      }

      await updatePassword(user, newPassword);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Подписка на изменения состояния аутентификации
   */
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Получение профиля пользователя по ID
   */
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const profileDoc = await getDoc(doc(db, 'users', userId));
      const profile = profileDoc.exists() ? { id: userId, ...profileDoc.data() } as UserProfile : null;
      return { profile, error: null };
    } catch (error) {
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date(),
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
