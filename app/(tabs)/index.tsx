import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { YStack, Text, H2, Card, Button, XStack, Avatar } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { ApiService } from '@/services/api';
import { User } from '@/types';

export default function SearchScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { currentLocation, getCurrentLocation } = useLocationStore();

  const loadUsers = async () => {
    if (!user || !currentLocation) return;

    setIsLoading(true);
    try {
      const nearbyUsers = await ApiService.findNearbyUsers(
        currentLocation.latitude,
        currentLocation.longitude,
        50, // 50 км радиус
        {
          ageRange: [18, 100],
          maxDistance: 50,
          gameCategories: [],
          skillLevels: [],
          playStyles: [],
          onlineOnly: false,
        },
        user.id
      );
      setUsers(nearbyUsers);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    if (currentLocation) {
      loadUsers();
    } else {
      getCurrentLocation();
    }
  }, [currentLocation]);

  const handleLike = async (likedUser: User) => {
    if (!user) return;

    try {
      await ApiService.createMatch(user.id, likedUser.id, 'default-game-id');
      // Удаляем пользователя из списка после лайка
      setUsers(prev => prev.filter(u => u.id !== likedUser.id));
    } catch (error) {
      console.error('Ошибка создания матча:', error);
    }
  };

  const handlePass = (passedUser: User) => {
    setUsers(prev => prev.filter(u => u.id !== passedUser.id));
  };

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" alignItems="center" justifyContent="center">
          <Text fontSize="$6" textAlign="center">
            Получение местоположения...
          </Text>
          <Button onPress={getCurrentLocation}>
            Разрешить геолокацию
          </Button>
        </YStack>
      </View>
    );
  }

  if (users.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" alignItems="center" justifyContent="center">
          <Text fontSize="$6" textAlign="center">
            Поблизости нет игроков
          </Text>
          <Text color="$gray10" textAlign="center">
            Попробуйте увеличить радиус поиска или обновить список
          </Text>
          <Button onPress={onRefresh}>
            Обновить
          </Button>
        </YStack>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack space="$4" padding="$4">
          <H2>Найди игроков поблизости</H2>
          
          {users.map((user) => (
            <Card key={user.id} padding="$4" backgroundColor="$gray1">
              <YStack space="$3">
                <XStack space="$3" alignItems="center">
                  <Avatar circular size="$6">
                    <Avatar.Image source={{ uri: user.avatar || 'https://via.placeholder.com/100' }} />
                    <Avatar.Fallback backgroundColor="$blue5">
                      <Text color="$blue10">{user.name[0]}</Text>
                    </Avatar.Fallback>
                  </Avatar>
                  <YStack flex={1}>
                    <Text fontSize="$5" fontWeight="600">{user.name}, {user.age}</Text>
                    <Text color="$gray10" fontSize="$3">
                      {user.location.city || 'Неизвестно'}
                    </Text>
                    {user.isOnline && (
                      <Text color="$green10" fontSize="$2">В сети</Text>
                    )}
                  </YStack>
                </XStack>

                {user.bio && (
                  <Text color="$gray10">{user.bio}</Text>
                )}

                <YStack space="$2">
                  <Text fontSize="$4" fontWeight="600">Любимые игры:</Text>
                  <XStack flexWrap="wrap" gap="$2">
                    {user.gamePreferences?.slice(0, 3).map((pref) => (
                      <Card key={pref.id} padding="$2" backgroundColor="$blue2">
                        <Text fontSize="$2" color="$blue10">
                          {pref.gameName}
                        </Text>
                      </Card>
                    ))}
                  </XStack>
                </YStack>

                <XStack space="$3" justifyContent="center">
                  <Button
                    onPress={() => handlePass(user)}
                    backgroundColor="$red5"
                    color="$red10"
                    flex={1}
                  >
                    Пропустить
                  </Button>
                  <Button
                    onPress={() => handleLike(user)}
                    backgroundColor="$green5"
                    color="$green10"
                    flex={1}
                  >
                    Лайк
                  </Button>
                </XStack>
              </YStack>
            </Card>
          ))}
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
});
