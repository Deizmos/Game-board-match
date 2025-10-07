import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Button, YStack, Text, XStack, Card, H3, Image, ScrollView } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import { GAME_CATEGORIES, SKILL_LEVELS, PLAY_STYLES } from '@/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SearchScreen() {
  const { user, signOut } = useAuthStore();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [potentialMatches, setPotentialMatches] = useState<User[]>([]);

  // Моковые данные для демонстрации
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'alex@example.com',
        name: 'Алексей',
        age: 28,
        bio: 'Люблю стратегические игры и кооперативные приключения. Ищу компанию для регулярных игровых вечеров.',
        avatar: undefined,
        location: { latitude: 55.7558, longitude: 37.6176, city: 'Москва' },
        gamePreferences: [
          {
            category: 'strategy',
            skillLevel: 'intermediate',
            playStyle: 'strategic',
            favoriteGames: ['Сеттлерс', 'Каркассон']
          }
        ],
        searchRadius: 25,
        ageRange: { min: 22, max: 35 },
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'maria@example.com',
        name: 'Мария',
        age: 25,
        bio: 'Фанат партийных игр и творческих головоломок. Всегда готова к новым знакомствам!',
        avatar: undefined,
        location: { latitude: 55.7558, longitude: 37.6176, city: 'Москва' },
        gamePreferences: [
          {
            category: 'party',
            skillLevel: 'beginner',
            playStyle: 'social',
            favoriteGames: ['Активити', 'Имаджинариум']
          }
        ],
        searchRadius: 30,
        ageRange: { min: 20, max: 30 },
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        email: 'dmitry@example.com',
        name: 'Дмитрий',
        age: 32,
        bio: 'Опытный игрок в настольные игры. Предпочитаю сложные стратегии и кооперативные игры.',
        avatar: undefined,
        location: { latitude: 55.7558, longitude: 37.6176, city: 'Москва' },
        gamePreferences: [
          {
            category: 'strategy',
            skillLevel: 'advanced',
            playStyle: 'competitive',
            favoriteGames: ['Пандемия', 'Семь чудес']
          }
        ],
        searchRadius: 20,
        ageRange: { min: 25, max: 40 },
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setPotentialMatches(mockUsers);
  }, []);

  const currentUser = potentialMatches[currentUserIndex];

  const handleLike = () => {
    if (currentUser) {
      Alert.alert('Лайк!', `Вы лайкнули ${currentUser.name}`);
      nextUser();
    }
  };

  const handlePass = () => {
    if (currentUser) {
      Alert.alert('Пас', `Вы пропустили ${currentUser.name}`);
      nextUser();
    }
  };

  const nextUser = () => {
    if (currentUserIndex < potentialMatches.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    } else {
      Alert.alert('Конец списка', 'Больше нет пользователей для просмотра');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$gray10">
            Нет пользователей для просмотра
          </Text>
          <Text textAlign="center" color="$gray10">
            Попробуйте изменить настройки поиска или проверьте позже
          </Text>
          <Button onPress={handleSignOut} variant="outlined">
            Выйти
          </Button>
        </YStack>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <YStack space="$4" padding="$4">
          {/* Заголовок */}
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Поиск игроков</H3>
            <Button size="$3" variant="outlined" onPress={handleSignOut}>
              Выйти
            </Button>
          </XStack>

          {/* Карточка пользователя */}
          <Card padding="$4" backgroundColor="$gray2" borderRadius="$4">
            <YStack space="$4">
              {/* Фото и основная информация */}
              <YStack space="$3" alignItems="center">
                <View style={styles.avatarPlaceholder}>
                  <Text fontSize="$8" color="$gray10">
                    {currentUser.name.charAt(0)}
                  </Text>
                </View>
                
                <YStack space="$1" alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">
                    {currentUser.name}, {currentUser.age}
                  </Text>
                  <Text fontSize="$3" color="$gray10">
                    {currentUser.location.city}
                  </Text>
                  <XStack space="$2" alignItems="center">
                    <View 
                      style={[
                        styles.onlineIndicator, 
                        { backgroundColor: currentUser.isOnline ? '#34C759' : '#FF9500' }
                      ]} 
                    />
                    <Text fontSize="$2" color="$gray10">
                      {currentUser.isOnline ? 'Онлайн' : 'Был(а) в сети недавно'}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>

              {/* Биография */}
              <YStack space="$2">
                <Text fontWeight="bold">О себе:</Text>
                <Text>{currentUser.bio}</Text>
              </YStack>

              {/* Предпочтения в играх */}
              <YStack space="$2">
                <Text fontWeight="bold">Предпочтения в играх:</Text>
                {currentUser.gamePreferences?.map((pref, index) => (
                  <Card key={index} padding="$2" backgroundColor="$blue2">
                    <Text fontSize="$3">
                      {GAME_CATEGORIES[pref.category]} • {SKILL_LEVELS[pref.skillLevel]} • {PLAY_STYLES[pref.playStyle]}
                    </Text>
                    {pref.favoriteGames.length > 0 && (
                      <Text fontSize="$2" color="$gray10" marginTop="$1">
                        Любимые игры: {pref.favoriteGames.join(', ')}
                      </Text>
                    )}
                  </Card>
                ))}
              </YStack>
            </YStack>
          </Card>

          {/* Кнопки действий */}
          <XStack space="$4" justifyContent="center">
            <Button
              size="$5"
              backgroundColor="$red10"
              color="white"
              borderRadius="$12"
              width={60}
              height={60}
              onPress={handlePass}
            >
              ✕
            </Button>
            
            <Button
              size="$5"
              backgroundColor="$green10"
              color="white"
              borderRadius="$12"
              width={60}
              height={60}
              onPress={handleLike}
            >
              ♥
            </Button>
          </XStack>

          {/* Индикатор прогресса */}
          <XStack space="$2" justifyContent="center">
            <Text fontSize="$2" color="$gray10">
              {currentUserIndex + 1} из {potentialMatches.length}
            </Text>
          </XStack>
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
