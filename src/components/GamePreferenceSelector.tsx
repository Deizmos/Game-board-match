import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { YStack, Text, Card, XStack, Button } from 'tamagui';
import { GAME_CATEGORIES, SKILL_LEVELS, PLAY_STYLES } from '@/constants';
import { GameCategory, SkillLevel, PlayStyle } from '@/types';

interface GamePreferenceSelectorProps {
  selectedCategories: GameCategory[];
  selectedSkillLevels: SkillLevel[];
  selectedPlayStyles: PlayStyle[];
  onCategoriesChange: (categories: GameCategory[]) => void;
  onSkillLevelsChange: (levels: SkillLevel[]) => void;
  onPlayStylesChange: (styles: PlayStyle[]) => void;
  title?: string;
}

export default function GamePreferenceSelector({
  selectedCategories,
  selectedSkillLevels,
  selectedPlayStyles,
  onCategoriesChange,
  onSkillLevelsChange,
  onPlayStylesChange,
  title = "Настройка предпочтений",
}: GamePreferenceSelectorProps) {
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

  return (
    <ScrollView style={styles.container}>
      <YStack space="$6" padding="$4">
        <Text fontSize="$6" fontWeight="600" textAlign="center">
          {title}
        </Text>

        {/* Категории игр */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Категории игр
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {GAME_CATEGORIES.map((category) => (
              <Card
                key={category.value}
                pressStyle={{ scale: 0.95 }}
                onPress={() => toggleSelection(selectedCategories, onCategoriesChange, category.value)}
                backgroundColor={selectedCategories.includes(category.value as GameCategory) ? '$blue5' : '$gray2'}
                padding="$3"
                borderRadius="$4"
              >
                <Text 
                  color={selectedCategories.includes(category.value as GameCategory) ? '$blue10' : '$gray10'}
                  fontSize="$3"
                >
                  {category.label}
                </Text>
              </Card>
            ))}
          </XStack>
        </YStack>

        {/* Уровень навыков */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Уровень игры
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {SKILL_LEVELS.map((level) => (
              <Card
                key={level.value}
                pressStyle={{ scale: 0.95 }}
                onPress={() => toggleSelection(selectedSkillLevels, onSkillLevelsChange, level.value)}
                backgroundColor={selectedSkillLevels.includes(level.value as SkillLevel) ? '$green5' : '$gray2'}
                padding="$3"
                borderRadius="$4"
              >
                <Text 
                  color={selectedSkillLevels.includes(level.value as SkillLevel) ? '$green10' : '$gray10'}
                  fontSize="$3"
                >
                  {level.label}
                </Text>
              </Card>
            ))}
          </XStack>
        </YStack>

        {/* Стиль игры */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Стиль игры
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {PLAY_STYLES.map((style) => (
              <Card
                key={style.value}
                pressStyle={{ scale: 0.95 }}
                onPress={() => toggleSelection(selectedPlayStyles, onPlayStylesChange, style.value)}
                backgroundColor={selectedPlayStyles.includes(style.value as PlayStyle) ? '$purple5' : '$gray2'}
                padding="$3"
                borderRadius="$4"
              >
                <Text 
                  color={selectedPlayStyles.includes(style.value as PlayStyle) ? '$purple10' : '$gray10'}
                  fontSize="$3"
                >
                  {style.label}
                </Text>
              </Card>
            ))}
          </XStack>
        </YStack>

        {/* Информация о выборе */}
        <Card padding="$4" backgroundColor="$blue1">
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="600" color="$blue10">
              Выбранные предпочтения:
            </Text>
            <Text color="$blue10" fontSize="$3">
              Категории: {selectedCategories.length}
            </Text>
            <Text color="$blue10" fontSize="$3">
              Уровни: {selectedSkillLevels.length}
            </Text>
            <Text color="$blue10" fontSize="$3">
              Стили: {selectedPlayStyles.length}
            </Text>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
