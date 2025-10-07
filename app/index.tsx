import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, YStack, Text, XStack } from 'tamagui';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <YStack space="$6" padding="$6" flex={1} justifyContent="center">
        <YStack space="$2" alignItems="center" marginBottom="$8">
          <Text fontSize="$10" fontWeight="bold" color="$blue10">
            GameBoardMatch
          </Text>
          <Text fontSize="$5" color="$gray10" textAlign="center">
            Найди партнеров для настольных игр
          </Text>
        </YStack>

        <YStack space="$4">
          <Link href="/register" asChild>
            <Button
              backgroundColor="$blue10"
              color="white"
              size="$5"
              fontWeight="bold"
            >
              Зарегистрироваться
            </Button>
          </Link>

          <Link href="/login" asChild>
            <Button
              variant="outlined"
              borderColor="$blue10"
              color="$blue10"
              size="$5"
              fontWeight="bold"
            >
              Войти
            </Button>
          </Link>
        </YStack>
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
