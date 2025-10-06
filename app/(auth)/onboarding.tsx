import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, YStack, Text, XStack, Card, H3 } from 'tamagui';
import { router } from 'expo-router';
import { GAME_CATEGORIES, SKILL_LEVELS, PLAY_STYLES } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { ApiService } from '@/services/api';

export default function OnboardingScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);
  const [selectedPlayStyles, setSelectedPlayStyles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile } = useAuthStore();

  const toggleSelection = (
    array: string[],
    setArray: (arr: string[]) => void,
    value: string
  ) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const handleComplete = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы одну категорию игр');
      return;
    }

    setIsLoading(true);
    try {
      // Обновляем профиль пользователя с предпочтениями
      if (user) {
        await updateProfile({
          gamePreferences: selectedCategories.map(category => ({
            id: `temp-${category}`,
            gameId: `temp-${category}`,
            gameName: GAME_CATEGORIES.find(c => c.value === category)?.label || category,
            gameCategory: category as any,
            skillLevel: selectedSkillLevels[0] as any || 'beginner',
            playStyle: selectedPlayStyles as any[],
            isFavorite: false,
          })),
        });
      }

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить предпочтения');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$6" padding="$6">
        <YStack space="$2" alignItems="center">
          <H3 color="$blue10">Настройка профиля</H3>
          <Text color="$gray10" textAlign="center">
            Расскажи о своих предпочтениях в играх
          </Text>
        </YStack>

        {/* Категории игр */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">Любимые категории игр</Text>
          <XStack flexWrap="wrap" gap="$2">
            {GAME_CATEGORIES.map((category) => (
              <Card
                key={category.value}
                pressStyle={{ scale: 0.95 }}
                onPress={() => toggleSelection(selectedCategories, setSelectedCategories, category.value)}
                backgroundColor={selectedCategories.includes(category.value) ? '$blue5' : '$gray2'}
                padding="$3"
                borderRadius="$4"
              >
                <Text color={selectedCategories.includes(category.value) ? '$blue10' : '$gray10'}>
                  {category.label}
                </Text>
              </Card>
            ))}
          </XStack>
        </YStack>

        {/* Уровень навыков */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">Уровень игры</Text>
          <XStack flexWrap="wrap" gap="$2">
            {SKILL_LEVELS.map((level) => (
              <Card
                key={level.value}
                pressStyle={{ scale: 0.95 }}
                onPress={() => toggleSelection(selectedSkillLevels, setSelectedSkillLevels, level.value)}
                backgroundColor={selectedSkillLevels.includes(level.value) ? '$green5' : '$gray2'}
                padding="$3"
                borderRadius="$4"
              >
                <Text color={selectedSkillLevels.includes(level.value) ? '$green10' : '$gray10'}>
                  {level.label}
                </Text>
              </Card>
            ))}
          </XStack>
        </YStack>

        {/* Стиль игры */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">Стиль игры</Text>
          <XStack flexWrap="wrap" gap="$2">
            {PLAY_STYLES.map((style) => (
              <Card
                key={style.value}
                pressStyle={{ scale: 0.95 }}
                onPress={() => toggleSelection(selectedPlayStyles, setSelectedPlayStyles, style.value)}
                backgroundColor={selectedPlayStyles.includes(style.value) ? '$purple5' : '$gray2'}
                padding="$3"
                borderRadius="$4"
              >
                <Text color={selectedPlayStyles.includes(style.value) ? '$purple10' : '$gray10'}>
                  {style.label}
                </Text>
              </Card>
            ))}
          </XStack>
        </YStack>

        <Button
          onPress={handleComplete}
          disabled={isLoading || selectedCategories.length === 0}
          backgroundColor="$blue10"
          color="white"
          size="$5"
        >
          {isLoading ? 'Сохранение...' : 'Завершить настройку'}
        </Button>
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
