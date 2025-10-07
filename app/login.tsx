import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input, YStack, Text, XStack } from 'tamagui';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      Alert.alert('Успех', 'Вы успешно вошли в систему!');
    } catch (error) {
      Alert.alert('Ошибка входа', 'Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <YStack space="$4" padding="$6" flex={1} justifyContent="center">
        <YStack space="$2" alignItems="center" marginBottom="$6">
          <Text fontSize="$8" fontWeight="bold" color="$blue10">
            Вход
          </Text>
          <Text fontSize="$4" color="$gray10" textAlign="center">
            Войдите в свой аккаунт
          </Text>
        </YStack>

        <YStack space="$3">
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </YStack>

        <Button
          onPress={handleLogin}
          disabled={isLoading}
          backgroundColor="$blue10"
          color="white"
          size="$4"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>

        <XStack justifyContent="center" space="$2">
          <Text color="$gray10">Нет аккаунта?</Text>
          <Link href="/register" asChild>
            <Button variant="outlined" size="$3">
              Регистрация
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
