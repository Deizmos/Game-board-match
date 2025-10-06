import { supabase } from '@/services/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Тестирование подключения к Supabase...');
    
    // Тест подключения к базе данных
    const { data, error } = await supabase
      .from('games')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      return false;
    }
    
    console.log('✅ Подключение к Supabase успешно!');
    
    // Тест получения игр
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .limit(5);
    
    if (gamesError) {
      console.error('❌ Ошибка получения игр:', gamesError);
      return false;
    }
    
    console.log('✅ Игры загружены:', games?.length || 0);
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    return false;
  }
};

// Функция для тестирования аутентификации
export const testAuth = async () => {
  try {
    console.log('🔍 Тестирование аутентификации...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Ошибка получения сессии:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Пользователь авторизован:', session.user.email);
    } else {
      console.log('ℹ️ Пользователь не авторизован');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка аутентификации:', error);
    return false;
  }
};
