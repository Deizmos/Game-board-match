import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { YStack, Text, H2, Card, Button, XStack, Avatar } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { ApiService } from '@/services/api';
import { Match } from '@/types';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userMatches = await ApiService.getMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      console.error('Ошибка загрузки матчей:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await ApiService.updateMatchStatus(matchId, 'accepted');
      loadMatches(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка принятия матча:', error);
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    try {
      await ApiService.updateMatchStatus(matchId, 'declined');
      loadMatches(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка отклонения матча:', error);
    }
  };

  if (matches.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" alignItems="center" justifyContent="center">
          <Text fontSize="$6" textAlign="center">
            Пока нет матчей
          </Text>
          <Text color="$gray10" textAlign="center">
            Начни поиск игроков, чтобы найти матчи
          </Text>
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
          <H2>Мои матчи</H2>
          
          {matches.map((match) => {
            const otherUser = match.userId1 === user?.id ? match.user2 : match.user1;
            const game = match.games;
            
            return (
              <Card key={match.id} padding="$4" backgroundColor="$gray1">
                <YStack space="$3">
                  <XStack space="$3" alignItems="center">
                    <Avatar circular size="$6">
                      <Avatar.Image source={{ uri: otherUser?.avatar || 'https://via.placeholder.com/100' }} />
                      <Avatar.Fallback backgroundColor="$blue5">
                        <Text color="$blue10">{otherUser?.name?.[0] || '?'}</Text>
                      </Avatar.Fallback>
                    </Avatar>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600">
                        {otherUser?.name || 'Неизвестно'}
                      </Text>
                      <Text color="$gray10" fontSize="$3">
                        {game?.name || 'Игра не указана'}
                      </Text>
                      <Text color="$gray10" fontSize="$2">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </Text>
                    </YStack>
                  </XStack>

                  <Text fontSize="$4" color="$gray10">
                    Статус: {getStatusText(match.status)}
                  </Text>

                  {match.status === 'pending' && (
                    <XStack space="$3" justifyContent="center">
                      <Button
                        onPress={() => handleDeclineMatch(match.id)}
                        backgroundColor="$red5"
                        color="$red10"
                        flex={1}
                      >
                        Отклонить
                      </Button>
                      <Button
                        onPress={() => handleAcceptMatch(match.id)}
                        backgroundColor="$green5"
                        color="$green10"
                        flex={1}
                      >
                        Принять
                      </Button>
                    </XStack>
                  )}

                  {match.status === 'accepted' && (
                    <Button
                      onPress={() => {/* Навигация к чату */}}
                      backgroundColor="$blue5"
                      color="$blue10"
                    >
                      Написать сообщение
                    </Button>
                  )}
                </YStack>
              </Card>
            );
          })}
        </YStack>
      </ScrollView>
    </View>
  );
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Ожидает ответа';
    case 'accepted':
      return 'Принят';
    case 'declined':
      return 'Отклонен';
    case 'expired':
      return 'Истек';
    default:
      return 'Неизвестно';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
