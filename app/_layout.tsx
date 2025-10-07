import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config/v3';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Предотвращаем автоматическое скрытие splash screen
SplashScreen.preventAutoHideAsync();

// Создаем конфигурацию Tamagui
const tamaguiConfig = createTamagui(config);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
      <StatusBar style="auto" />
    </TamaguiProvider>
  );
}
