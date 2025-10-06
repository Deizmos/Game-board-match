import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { YStack, Text, H2, Card, Button, XStack, Avatar, Input } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { ApiService } from '@/services/api';
import { GAME_CATEGORIES, SKILL_LEVELS, PLAY_STYLES } from '@/constants';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    age: '',
  });
  const { user, updateProfile, signOut } = useAuthStore();
  const { currentLocation, getCurrentLocation } = useLocationStore();

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        bio: user.bio || '',
        age: user.age.toString(),
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfile({
        name: editData.name,
        bio: editData.bio,
        age: parseInt(editData.age),
      });
      setIsEditing(false);
      Alert.alert('Успех', 'Профиль обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        name: user.name,
        bio: user.bio || '',
        age: user.age.toString(),
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const updateLocation = async () => {
    await getCurrentLocation();
    if (currentLocation && user) {
      await updateProfile({ location: currentLocation });
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" alignItems="center" justifyContent="center">
          <Text fontSize="$6">Ошибка загрузки профиля</Text>
        </YStack>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <H2>Мой профиль</H2>

        {/* Аватар и основная информация */}
        <Card padding="$4" backgroundColor="$gray1">
          <YStack space="$4" alignItems="center">
            <Avatar circular size="$8">
              <Avatar.Image source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} />
              <Avatar.Fallback backgroundColor="$blue5">
                <Text color="$blue10" fontSize="$8">{user.name[0]}</Text>
              </Avatar.Fallback>
            </Avatar>

            {isEditing ? (
              <YStack space="$3" width="100%">
                <Input
                  placeholder="Имя"
                  value={editData.name}
                  onChangeText={(value) => setEditData(prev => ({ ...prev, name: value }))}
                />
                <Input
                  placeholder="Возраст"
                  value={editData.age}
                  onChangeText={(value) => setEditData(prev => ({ ...prev, age: value }))}
                  keyboardType="numeric"
                />
                <Input
                  placeholder="О себе"
                  value={editData.bio}
                  onChangeText={(value) => setEditData(prev => ({ ...prev, bio: value }))}
                  multiline
                  numberOfLines={3}
                />
                <XStack space="$3">
                  <Button onPress={handleCancel} flex={1} variant="outlined">
                    Отмена
                  </Button>
                  <Button onPress={handleSave} flex={1} backgroundColor="$blue10">
                    Сохранить
                  </Button>
                </XStack>
              </YStack>
            ) : (
              <YStack space="$2" alignItems="center">
                <Text fontSize="$6" fontWeight="600">{user.name}, {user.age}</Text>
                <Text color="$gray10" textAlign="center">
                  {user.location.city || 'Местоположение не указано'}
                </Text>
                {user.bio && (
                  <Text color="$gray10" textAlign="center" marginTop="$2">
                    {user.bio}
                  </Text>
                )}
                <Button onPress={() => setIsEditing(true)} marginTop="$3">
                  Редактировать профиль
                </Button>
              </YStack>
            )}
          </YStack>
        </Card>

        {/* Местоположение */}
        <Card padding="$4" backgroundColor="$gray1">
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">Местоположение</Text>
            <Text color="$gray10">
              {user.location.city || 'Не указано'}
            </Text>
            <Button onPress={updateLocation} size="$3">
              Обновить местоположение
            </Button>
          </YStack>
        </Card>

        {/* Предпочтения в играх */}
        <Card padding="$4" backgroundColor="$gray1">
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">Предпочтения в играх</Text>
            {user.gamePreferences && user.gamePreferences.length > 0 ? (
              <YStack space="$2">
                {user.gamePreferences.map((pref) => (
                  <XStack key={pref.id} justifyContent="space-between" alignItems="center">
                    <Text>{pref.gameName}</Text>
                    <Text color="$gray10" fontSize="$2">
                      {SKILL_LEVELS.find(l => l.value === pref.skillLevel)?.label}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            ) : (
              <Text color="$gray10">Предпочтения не настроены</Text>
            )}
            <Button size="$3" variant="outlined">
              Настроить предпочтения
            </Button>
          </YStack>
        </Card>

        {/* Статистика */}
        <Card padding="$4" backgroundColor="$gray1">
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">Статистика</Text>
            <XStack justifyContent="space-between">
              <Text>Матчи:</Text>
              <Text color="$blue10">0</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Игры:</Text>
              <Text color="$green10">0</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>В сети:</Text>
              <Text color={user.isOnline ? '$green10' : '$red10'}>
                {user.isOnline ? 'Да' : 'Нет'}
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Выход */}
        <Button
          onPress={handleSignOut}
          backgroundColor="$red5"
          color="$red10"
          marginTop="$4"
        >
          Выйти из аккаунта
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
