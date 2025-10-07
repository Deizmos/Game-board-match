import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, YStack, Text, XStack, Card, H3, Image } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { Match } from '@/types';

export default function MatchesScreen() {
  const { user, signOut } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);

  // Моковые данные для демонстрации
  React.useEffect(() => {
    const mockMatches: Match[] = [
      {
        id: '1',
        users: ['current_user', 'user1'],
        status: 'accepted',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
        acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 день назад
        gamePreferences: {
          commonGames: ['Сеттлерс', 'Каркассон'],
          compatibility: 85
        }
      },
      {
        id: '2',
        users: ['current_user', 'user2'],
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
        gamePreferences: {
          commonGames: ['Пандемия'],
          compatibility: 72
        }
      },
      {
        id: '3',
        users: ['current_user', 'user3'],
        status: 'accepted',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 дней назад
        acceptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 дня назад
        gamePreferences: {
          commonGames: ['Активити', 'Имаджинариум'],
          compatibility: 90
        }
      },
    ];
    setMatches(mockMatches);
  }, []);

  const handleAcceptMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, status: 'accepted' as const, acceptedAt: new Date() }
        : match
    ));
  };

  const handleDeclineMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, status: 'declined' as const }
        : match
    ));
  };

  const getMatchStatusText = (status: Match['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает ответа';
      case 'accepted': return 'Принят';
      case 'declined': return 'Отклонен';
      case 'expired': return 'Истек';
      default: return 'Неизвестно';
    }
  };

  const getMatchStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'accepted': return '#34C759';
      case 'declined': return '#FF3B30';
      case 'expired': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const acceptedMatches = matches.filter(match => match.status === 'accepted');
  const pendingMatches = matches.filter(match => match.status === 'pending');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <YStack space="$4" padding="$4">
          {/* Заголовок */}
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Матчи</H3>
            <Button size="$3" variant="outlined" onPress={signOut}>
              Выйти
            </Button>
          </XStack>

          {/* Статистика */}
          <Card padding="$4" backgroundColor="$blue2">
            <YStack space="$2">
              <Text fontWeight="bold" color="$blue10">Статистика</Text>
              <XStack space="$4">
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold" color="$blue10">
                    {acceptedMatches.length}
                  </Text>
                  <Text fontSize="$2" color="$gray10">Принятых матчей</Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold" color="$orange10">
                    {pendingMatches.length}
                  </Text>
                  <Text fontSize="$2" color="$gray10">Ожидают ответа</Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>

          {/* Ожидающие ответа */}
          {pendingMatches.length > 0 && (
            <YStack space="$3">
              <Text fontWeight="bold" fontSize="$5">Ожидают вашего ответа</Text>
              {pendingMatches.map((match) => (
                <Card key={match.id} padding="$4" backgroundColor="$gray2">
                  <YStack space="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack space="$1">
                        <Text fontWeight="bold">Новый матч!</Text>
                        <Text fontSize="$3" color="$gray10">
                          Совместимость: {match.gamePreferences?.compatibility}%
                        </Text>
                      </YStack>
                      <View 
                        style={[
                          styles.statusBadge, 
                          { backgroundColor: getMatchStatusColor(match.status) }
                        ]}
                      >
                        <Text fontSize="$2" color="white">
                          {getMatchStatusText(match.status)}
                        </Text>
                      </View>
                    </XStack>
                    
                    {match.gamePreferences?.commonGames && (
                      <YStack space="$1">
                        <Text fontSize="$3" fontWeight="bold">Общие игры:</Text>
                        <Text fontSize="$3">
                          {match.gamePreferences.commonGames.join(', ')}
                        </Text>
                      </YStack>
                    )}
                    
                    <XStack space="$3">
                      <Button
                        flex={1}
                        backgroundColor="$green10"
                        color="white"
                        onPress={() => handleAcceptMatch(match.id)}
                      >
                        Принять
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor="$red10"
                        color="white"
                        onPress={() => handleDeclineMatch(match.id)}
                      >
                        Отклонить
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              ))}
            </YStack>
          )}

          {/* Принятые матчи */}
          {acceptedMatches.length > 0 && (
            <YStack space="$3">
              <Text fontWeight="bold" fontSize="$5">Ваши матчи</Text>
              {acceptedMatches.map((match) => (
                <Card key={match.id} padding="$4" backgroundColor="$gray2">
                  <YStack space="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack space="$1">
                        <Text fontWeight="bold">Матч принят</Text>
                        <Text fontSize="$3" color="$gray10">
                          Совместимость: {match.gamePreferences?.compatibility}%
                        </Text>
                        <Text fontSize="$2" color="$gray10">
                          Принят {match.acceptedAt?.toLocaleDateString()}
                        </Text>
                      </YStack>
                      <View 
                        style={[
                          styles.statusBadge, 
                          { backgroundColor: getMatchStatusColor(match.status) }
                        ]}
                      >
                        <Text fontSize="$2" color="white">
                          {getMatchStatusText(match.status)}
                        </Text>
                      </View>
                    </XStack>
                    
                    {match.gamePreferences?.commonGames && (
                      <YStack space="$1">
                        <Text fontSize="$3" fontWeight="bold">Общие игры:</Text>
                        <Text fontSize="$3">
                          {match.gamePreferences.commonGames.join(', ')}
                        </Text>
                      </YStack>
                    )}
                    
                    <Button
                      backgroundColor="$blue10"
                      color="white"
                      onPress={() => {
                        // Здесь будет навигация к чату
                        console.log('Открыть чат с матчем:', match.id);
                      }}
                    >
                      Написать сообщение
                    </Button>
                  </YStack>
                </Card>
              ))}
            </YStack>
          )}

          {/* Пустое состояние */}
          {matches.length === 0 && (
            <YStack space="$4" padding="$8" alignItems="center">
              <Text fontSize="$6" fontWeight="bold" color="$gray10">
                Пока нет матчей
              </Text>
              <Text textAlign="center" color="$gray10">
                Начните лайкать пользователей на главном экране, чтобы найти игроков для совместных игр!
              </Text>
            </YStack>
          )}
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
