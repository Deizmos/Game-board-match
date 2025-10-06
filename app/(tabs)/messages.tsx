import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { YStack, Text, H2, Card, Button, XStack, Avatar } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { ApiService } from '@/services/api';
import { Match, Message } from '@/types';

export default function MessagesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadAcceptedMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const allMatches = await ApiService.getMatches(user.id);
      // Фильтруем только принятые матчи
      const acceptedMatches = allMatches.filter(match => match.status === 'accepted');
      setMatches(acceptedMatches);
    } catch (error) {
      console.error('Ошибка загрузки матчей:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAcceptedMatches();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAcceptedMatches();
  }, [user]);

  if (matches.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$6" alignItems="center" justifyContent="center">
          <Text fontSize="$6" textAlign="center">
            Нет активных чатов
          </Text>
          <Text color="$gray10" textAlign="center">
            Начни общение с принятыми матчами
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
          <H2>Сообщения</H2>
          
          {matches.map((match) => {
            const otherUser = match.userId1 === user?.id ? match.user2 : match.user1;
            const game = match.games;
            const lastMessage = match.messages?.[match.messages.length - 1];
            
            return (
              <Card key={match.id} padding="$4" backgroundColor="$gray1">
                <XStack space="$3" alignItems="center">
                  <Avatar circular size="$6">
                    <Avatar.Image source={{ uri: otherUser?.avatar || 'https://via.placeholder.com/100' }} />
                    <Avatar.Fallback backgroundColor="$blue5">
                      <Text color="$blue10">{otherUser?.name?.[0] || '?'}</Text>
                    </Avatar.Fallback>
                  </Avatar>
                  
                  <YStack flex={1} space="$1">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$5" fontWeight="600">
                        {otherUser?.name || 'Неизвестно'}
                      </Text>
                      {lastMessage && (
                        <Text fontSize="$2" color="$gray10">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      )}
                    </XStack>
                    
                    <Text fontSize="$3" color="$gray10">
                      {game?.name || 'Игра не указана'}
                    </Text>
                    
                    {lastMessage ? (
                      <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                        {lastMessage.content}
                      </Text>
                    ) : (
                      <Text fontSize="$3" color="$blue10">
                        Начните общение
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Card>
            );
          })}
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
