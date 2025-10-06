import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testSupabaseConnection, testAuth } from '@/utils/supabaseTest';
import { AuthService, GameService } from '@/services/dataService';

export const SupabaseTestComponent: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gamesCount, setGamesCount] = useState(0);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await testSupabaseConnection();
      setIsConnected(connected);
      
      if (connected) {
        const games = await GameService.getAllGames();
        setGamesCount(games.length);
      }
    } catch (error) {
      console.error('Ошибка тестирования:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    try {
      const authWorking = await testAuth();
      Alert.alert(
        'Тест аутентификации', 
        authWorking ? 'Аутентификация работает' : 'Проблемы с аутентификацией'
      );
    } catch (error) {
      console.error('Ошибка тестирования аутентификации:', error);
      Alert.alert('Ошибка', 'Проблемы с аутентификацией');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return '#666';
    return isConnected ? '#4CAF50' : '#F44336';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Проверка...';
    return isConnected ? 'Подключено' : 'Не подключено';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест подключения Supabase</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {isConnected && (
        <Text style={styles.infoText}>
          Игр в базе данных: {gamesCount}
        </Text>
      )}

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Тестирование...' : 'Повторить тест'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
        onPress={testAuthentication}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Тест аутентификации
        </Text>
      </TouchableOpacity>

      {!isConnected && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Проверьте:</Text>
          <Text style={styles.helpText}>• Файл .env создан и содержит правильные ключи</Text>
          <Text style={styles.helpText}>• Supabase проект создан и активен</Text>
          <Text style={styles.helpText}>• SQL схема выполнена в Supabase</Text>
          <Text style={styles.helpText}>• Интернет соединение активно</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  helpContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});
