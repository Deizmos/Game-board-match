import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Input, YStack, Text, XStack } from 'tamagui';
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuthStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, age } = formData;

    if (!name || !email || !password || !confirmPassword || !age) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      Alert.alert('Ошибка', 'Возраст должен быть от 18 до 100 лет');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Начинаем регистрацию пользователя:', { email, name, age: ageNum });
      
      await signUp(email, password, {
        name,
        age: ageNum,
        location: { latitude: 0, longitude: 0 },
      });

      console.log('Регистрация успешна');
      Alert.alert('Успех', 'Аккаунт успешно создан!');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      Alert.alert('Ошибка регистрации', `Не удалось создать аккаунт: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$6" flex={1} justifyContent="center">
        <YStack space="$2" alignItems="center" marginBottom="$6">
          <Text fontSize="$8" fontWeight="bold" color="$blue10">
            Регистрация
          </Text>
          <Text fontSize="$4" color="$gray10" textAlign="center">
            Создай аккаунт и найди игроков
          </Text>
        </YStack>

        <YStack space="$3">
          <Input
            placeholder="Имя"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            autoComplete="name"
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            placeholder="Возраст"
            value={formData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            keyboardType="numeric"
          />
          <Input
            placeholder="Пароль"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            autoComplete="password"
          />
          <Input
            placeholder="Подтвердите пароль"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
            autoComplete="password"
          />
        </YStack>

        <Button
          onPress={handleRegister}
          disabled={isLoading}
          backgroundColor="$blue10"
          color="white"
          size="$4"
        >
          {isLoading ? 'Создание...' : 'Создать аккаунт'}
        </Button>

        <XStack justifyContent="center" space="$2" marginTop="$4">
          <Text color="$gray10">Уже есть аккаунт?</Text>
          <Link href="/login" asChild>
            <Button variant="outlined" size="$3">
              Войти
            </Button>
          </Link>
        </XStack>

        <XStack justifyContent="center" marginTop="$4">
          <Link href="/" asChild>
            <Button variant="ghost" size="$3">
              ← Назад
            </Button>
          </Link>
        </XStack>
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
