import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, YStack, Text, XStack, Card, H3, Input, H4 } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { GAME_CATEGORIES, SKILL_LEVELS, PLAY_STYLES } from '@/constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: user?.bio || '',
    searchRadius: user?.searchRadius || 25,
    ageRangeMin: user?.ageRange?.min || 20,
    ageRangeMax: user?.ageRange?.max || 50,
  });

  const handleSave = () => {
    // Здесь будет сохранение изменений в Firebase
    Alert.alert('Успех', 'Профиль обновлен!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      bio: user?.bio || '',
      searchRadius: user?.searchRadius || 25,
      ageRangeMin: user?.ageRange?.min || 20,
      ageRangeMax: user?.ageRange?.max || 50,
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$gray10">
            Пользователь не найден
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
      <ScrollView style={styles.scrollView}>
        <YStack space="$4" padding="$4">
          {/* Заголовок */}
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Профиль</H3>
            <Button size="$3" variant="outlined" onPress={handleSignOut}>
              Выйти
            </Button>
          </XStack>

          {/* Основная информация */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$4">
              <YStack space="$2" alignItems="center">
                <View style={styles.avatarPlaceholder}>
                  <Text fontSize="$8" color="$gray10">
                    {user.name.charAt(0)}
                  </Text>
                </View>
                <H4>{user.name}</H4>
                <Text color="$gray10">{user.email}</Text>
                <Text color="$gray10">Возраст: {user.age}</Text>
                <Text color="$gray10">Город: {user.location.city || 'Не указан'}</Text>
              </YStack>

              <XStack space="$3">
                <Button
                  flex={1}
                  backgroundColor="$blue10"
                  color="white"
                  onPress={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Отменить' : 'Редактировать'}
                </Button>
                {isEditing && (
                  <Button
                    flex={1}
                    backgroundColor="$green10"
                    color="white"
                    onPress={handleSave}
                  >
                    Сохранить
                  </Button>
                )}
              </XStack>
            </YStack>
          </Card>

          {/* Биография */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <H4>О себе</H4>
              {isEditing ? (
                <Input
                  placeholder="Расскажите о себе..."
                  value={editData.bio}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, bio: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <Text>{user.bio || 'Биография не указана'}</Text>
              )}
            </YStack>
          </Card>

          {/* Предпочтения в играх */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <H4>Предпочтения в играх</H4>
              {user.gamePreferences && user.gamePreferences.length > 0 ? (
                <YStack space="$2">
                  {user.gamePreferences.map((pref, index) => (
                    <Card key={index} padding="$3" backgroundColor="$blue2">
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
              ) : (
                <Text color="$gray10">Предпочтения не настроены</Text>
              )}
            </YStack>
          </Card>

          {/* Настройки поиска */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <H4>Настройки поиска</H4>
              
              <YStack space="$2">
                <Text fontWeight="bold">Радиус поиска</Text>
                {isEditing ? (
                  <Input
                    placeholder="25"
                    value={editData.searchRadius.toString()}
                    onChangeText={(text) => setEditData(prev => ({ 
                      ...prev, 
                      searchRadius: parseInt(text) || 25 
                    }))}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text>{user.searchRadius || 25} км</Text>
                )}
              </YStack>

              <YStack space="$2">
                <Text fontWeight="bold">Возрастной диапазон</Text>
                {isEditing ? (
                  <XStack space="$3">
                    <YStack space="$1" flex={1}>
                      <Text fontSize="$2">От</Text>
                      <Input
                        placeholder="20"
                        value={editData.ageRangeMin.toString()}
                        onChangeText={(text) => setEditData(prev => ({ 
                          ...prev, 
                          ageRangeMin: parseInt(text) || 20 
                        }))}
                        keyboardType="numeric"
                      />
                    </YStack>
                    <YStack space="$1" flex={1}>
                      <Text fontSize="$2">До</Text>
                      <Input
                        placeholder="50"
                        value={editData.ageRangeMax.toString()}
                        onChangeText={(text) => setEditData(prev => ({ 
                          ...prev, 
                          ageRangeMax: parseInt(text) || 50 
                        }))}
                        keyboardType="numeric"
                      />
                    </YStack>
                  </XStack>
                ) : (
                  <Text>
                    {user.ageRange?.min || 20} - {user.ageRange?.max || 50} лет
                  </Text>
                )}
              </YStack>
            </YStack>
          </Card>

          {/* Статистика */}
          <Card padding="$4" backgroundColor="$blue2">
            <YStack space="$3">
              <H4 color="$blue10">Статистика</H4>
              <XStack space="$4" justifyContent="space-around">
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold" color="$blue10">0</Text>
                  <Text fontSize="$2" color="$gray10">Матчей</Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold" color="$blue10">0</Text>
                  <Text fontSize="$2" color="$gray10">Сообщений</Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold" color="$blue10">0</Text>
                  <Text fontSize="$2" color="$gray10">Игр сыграно</Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>

          {/* Дополнительные настройки */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <H4>Дополнительно</H4>
              <Button variant="outlined" onPress={() => Alert.alert('Уведомления', 'Настройки уведомлений')}>
                Уведомления
              </Button>
              <Button variant="outlined" onPress={() => Alert.alert('Приватность', 'Настройки приватности')}>
                Приватность
              </Button>
              <Button variant="outlined" onPress={() => Alert.alert('Помощь', 'Центр помощи')}>
                Помощь
              </Button>
            </YStack>
          </Card>
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
  scrollView: {
    flex: 1,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
