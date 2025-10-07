import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo',
};

// Проверка конфигурации (только в продакшене)
if (process.env.NODE_ENV === 'production' && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  throw new Error('Отсутствуют переменные окружения Firebase');
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Подключение к эмуляторам в режиме разработки
if (__DEV__) {
  // Раскомментируйте для использования эмуляторов
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;
