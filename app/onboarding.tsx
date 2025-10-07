import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, YStack, Text, XStack, Card, H3, H4 } from 'tamagui';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { 
  GAME_CATEGORIES, 
  SKILL_LEVELS, 
  PLAY_STYLES, 
  POPULAR_GAMES, 
  SEARCH_SETTINGS 
} from '@/constants';
import { GameCategory, SkillLevel, PlayStyle, OnboardingData } from '@/types';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    gamePreferences: [],
    bio: '',
    searchRadius: SEARCH_SETTINGS.DEFAULT_RADIUS,
    ageRange: SEARCH_SETTINGS.DEFAULT_AGE_RANGE,
    location: { latitude: 0, longitude: 0 }
  });

  const { user, updateUserProfile } = useAuthStore();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      if (!user) {
        Alert.alert('Ошибка', 'Пользователь не найден');
        return;
      }

      await updateUserProfile({
        ...onboardingData,
        gamePreferences: onboardingData.gamePreferences || [],
        bio: onboardingData.bio || '',
        searchRadius: onboardingData.searchRadius || SEARCH_SETTINGS.DEFAULT_RADIUS,
        ageRange: onboardingData.ageRange || SEARCH_SETTINGS.DEFAULT_AGE_RANGE,
        location: onboardingData.location || { latitude: 0, longitude: 0 }
      });

      Alert.alert('Успех', 'Профиль настроен! Добро пожаловать в GameBoardMatch!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
    }
  };

  const toggleGamePreference = (category: GameCategory, skillLevel: SkillLevel, playStyle: PlayStyle) => {
    const preferences = onboardingData.gamePreferences || [];
    const existingIndex = preferences.findIndex(
      pref => pref.category === category && pref.skillLevel === skillLevel && pref.playStyle === playStyle
    );

    if (existingIndex >= 0) {
      // Удаляем существующее предпочтение
      const newPreferences = preferences.filter((_, index) => index !== existingIndex);
      setOnboardingData(prev => ({ ...prev, gamePreferences: newPreferences }));
    } else {
      // Добавляем новое предпочтение
      const newPreferences = [...preferences, { category, skillLevel, playStyle, favoriteGames: [] }];
      setOnboardingData(prev => ({ ...prev, gamePreferences: newPreferences }));
    }
  };

  const isPreferenceSelected = (category: GameCategory, skillLevel: SkillLevel, playStyle: PlayStyle) => {
    return (onboardingData.gamePreferences || []).some(
      pref => pref.category === category && pref.skillLevel === skillLevel && pref.playStyle === playStyle
    );
  };

  const renderStep1 = () => (
    <YStack space="$4" padding="$4">
      <H3 textAlign="center" color="$blue10">Выберите предпочтения в играх</H3>
      <Text textAlign="center" color="$gray10">
        Отметьте категории игр, которые вам нравятся
      </Text>
      
      <YStack space="$3">
        {Object.entries(GAME_CATEGORIES).map(([key, label]) => (
          <Card key={key} padding="$3" backgroundColor="$gray2">
            <H4>{label}</H4>
            <YStack space="$2" marginTop="$2">
              {Object.entries(SKILL_LEVELS).map(([skillKey, skillLabel]) => (
                <YStack key={skillKey} space="$1">
                  <Text fontSize="$3" fontWeight="bold">{skillLabel}</Text>
                  <XStack space="$2" flexWrap="wrap">
                    {Object.entries(PLAY_STYLES).map(([styleKey, styleLabel]) => (
                      <Button
                        key={styleKey}
                        size="$2"
                        variant={isPreferenceSelected(key as GameCategory, skillKey as SkillLevel, styleKey as PlayStyle) ? "outlined" : "outlined"}
                        backgroundColor={isPreferenceSelected(key as GameCategory, skillKey as SkillLevel, styleKey as PlayStyle) ? "$blue4" : "transparent"}
                        borderColor="$blue8"
                        onPress={() => toggleGamePreference(key as GameCategory, skillKey as SkillLevel, styleKey as PlayStyle)}
                      >
                        {styleLabel}
                      </Button>
                    ))}
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </Card>
        ))}
      </YStack>
    </YStack>
  );

  const renderStep2 = () => (
    <YStack space="$4" padding="$4">
      <H3 textAlign="center" color="$blue10">Расскажите о себе</H3>
      <Text textAlign="center" color="$gray10">
        Напишите краткую биографию, чтобы другие игроки могли узнать вас лучше
      </Text>
      
      <Input
        placeholder="Расскажите о себе, ваших любимых играх и стиле игры..."
        value={onboardingData.bio || ''}
        onChangeText={(text) => setOnboardingData(prev => ({ ...prev, bio: text }))}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      
      <Text fontSize="$2" color="$gray10">
        Минимум 20 символов, максимум 500
      </Text>
    </YStack>
  );

  const renderStep3 = () => (
    <YStack space="$4" padding="$4">
      <H3 textAlign="center" color="$blue10">Настройки поиска</H3>
      <Text textAlign="center" color="$gray10">
        Укажите параметры для поиска игроков
      </Text>
      
      <YStack space="$3">
        <YStack space="$2">
          <Text fontWeight="bold">Радиус поиска: {onboardingData.searchRadius} км</Text>
          <XStack space="$2" alignItems="center">
            <Text>{SEARCH_SETTINGS.MIN_RADIUS} км</Text>
            <View style={{ flex: 1, height: 20, backgroundColor: '#e0e0e0', borderRadius: 10 }}>
              <View 
                style={{ 
                  width: `${((onboardingData.searchRadius || 25) - SEARCH_SETTINGS.MIN_RADIUS) / (SEARCH_SETTINGS.MAX_RADIUS - SEARCH_SETTINGS.MIN_RADIUS) * 100}%`,
                  height: '100%',
                  backgroundColor: '#007AFF',
                  borderRadius: 10
                }} 
              />
            </View>
            <Text>{SEARCH_SETTINGS.MAX_RADIUS} км</Text>
          </XStack>
        </YStack>
        
        <YStack space="$2">
          <Text fontWeight="bold">Возрастной диапазон</Text>
          <XStack space="$3" alignItems="center">
            <YStack space="$1">
              <Text fontSize="$2">От</Text>
              <Input
                placeholder="20"
                value={onboardingData.ageRange?.min?.toString() || ''}
                onChangeText={(text) => {
                  const min = parseInt(text) || SEARCH_SETTINGS.MIN_AGE;
                  setOnboardingData(prev => ({
                    ...prev,
                    ageRange: { ...prev.ageRange!, min: Math.max(SEARCH_SETTINGS.MIN_AGE, Math.min(min, prev.ageRange?.max || SEARCH_SETTINGS.MAX_AGE)) }
                  }));
                }}
                keyboardType="numeric"
                width={80}
              />
            </YStack>
            <Text>до</Text>
            <YStack space="$1">
              <Text fontSize="$2">До</Text>
              <Input
                placeholder="50"
                value={onboardingData.ageRange?.max?.toString() || ''}
                onChangeText={(text) => {
                  const max = parseInt(text) || SEARCH_SETTINGS.MAX_AGE;
                  setOnboardingData(prev => ({
                    ...prev,
                    ageRange: { ...prev.ageRange!, max: Math.min(SEARCH_SETTINGS.MAX_AGE, Math.max(max, prev.ageRange?.min || SEARCH_SETTINGS.MIN_AGE)) }
                  }));
                }}
                keyboardType="numeric"
                width={80}
              />
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );

  const renderStep4 = () => (
    <YStack space="$4" padding="$4">
      <H3 textAlign="center" color="$blue10">Готово!</H3>
      <Text textAlign="center" color="$gray10">
        Проверьте ваши настройки и завершите настройку профиля
      </Text>
      
      <Card padding="$4" backgroundColor="$gray2">
        <YStack space="$3">
          <Text fontWeight="bold">Выбранные предпочтения:</Text>
          {(onboardingData.gamePreferences || []).map((pref, index) => (
            <Text key={index} fontSize="$3">
              • {GAME_CATEGORIES[pref.category]} - {SKILL_LEVELS[pref.skillLevel]} - {PLAY_STYLES[pref.playStyle]}
            </Text>
          ))}
          
          <Text fontWeight="bold">Биография:</Text>
          <Text fontSize="$3">{onboardingData.bio || 'Не указана'}</Text>
          
          <Text fontWeight="bold">Настройки поиска:</Text>
          <Text fontSize="$3">Радиус: {onboardingData.searchRadius} км</Text>
          <Text fontSize="$3">Возраст: {onboardingData.ageRange?.min} - {onboardingData.ageRange?.max} лет</Text>
        </YStack>
      </Card>
    </YStack>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return (onboardingData.gamePreferences || []).length > 0;
      case 2: return (onboardingData.bio || '').length >= 20;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderCurrentStep()}
      </ScrollView>
      
      <YStack space="$3" padding="$4" backgroundColor="white" borderTopWidth={1} borderTopColor="$gray6">
        <XStack space="$2" justifyContent="center">
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: step <= currentStep ? '#007AFF' : '#E0E0E0'
              }}
            />
          ))}
        </XStack>
        
        <XStack space="$3">
          {currentStep > 1 && (
            <Button
              variant="outlined"
              borderColor="$blue8"
              color="$blue8"
              flex={1}
              onPress={handleBack}
            >
              Назад
            </Button>
          )}
          
          <Button
            backgroundColor="$blue10"
            color="white"
            flex={1}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === 4 ? 'Завершить' : 'Далее'}
          </Button>
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
  scrollView: {
    flex: 1,
  },
});
