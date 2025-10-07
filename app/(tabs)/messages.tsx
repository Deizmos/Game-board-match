import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Button, YStack, Text, XStack, Card, H3, Input } from 'tamagui';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types';

export default function MessagesScreen() {
  const { user, signOut } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Моковые данные для демонстрации
  React.useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        matchId: 'match1',
        senderId: 'user1',
        content: 'Привет! Видел, что ты любишь стратегические игры. Хочешь сыграть в Сеттлерс?',
        type: 'text',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
      },
      {
        id: '2',
        matchId: 'match1',
        senderId: 'current_user',
        content: 'Привет! Да, отличная идея! Когда удобно встретиться?',
        type: 'text',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: '3',
        matchId: 'match1',
        senderId: 'user1',
        content: 'Может быть в субботу вечером? У меня есть настольное кафе рядом с домом.',
        type: 'text',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
        readAt: undefined, // Не прочитано
      },
      {
        id: '4',
        matchId: 'match2',
        senderId: 'user2',
        content: 'Привет! Ты играешь в Пандемию? Ищу партнеров для кооперативной игры!',
        type: 'text',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 день назад
        readAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 часов назад
      },
    ];
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        matchId: 'match1', // В реальном приложении это будет выбранный матч
        senderId: 'current_user',
        content: newMessage.trim(),
        type: 'text',
        createdAt: new Date(),
        readAt: new Date(),
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => 
      msg.senderId !== 'current_user' && !msg.readAt
    ).length;
  };

  const getLastMessage = (matchId: string) => {
    const matchMessages = messages.filter(msg => msg.matchId === matchId);
    return matchMessages[matchMessages.length - 1];
  };

  const getMatchMessages = (matchId: string) => {
    return messages.filter(msg => msg.matchId === matchId);
  };

  // Группируем сообщения по матчам
  const matchIds = [...new Set(messages.map(msg => msg.matchId))];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <YStack space="$4" padding="$4">
          {/* Заголовок */}
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Сообщения</H3>
            <XStack space="$2" alignItems="center">
              {getUnreadCount() > 0 && (
                <View style={styles.unreadBadge}>
                  <Text fontSize="$2" color="white" fontWeight="bold">
                    {getUnreadCount()}
                  </Text>
                </View>
              )}
              <Button size="$3" variant="outlined" onPress={signOut}>
                Выйти
              </Button>
            </XStack>
          </XStack>

          {/* Список чатов */}
          {matchIds.length > 0 ? (
            <YStack space="$3">
              {matchIds.map((matchId) => {
                const lastMessage = getLastMessage(matchId);
                const matchMessages = getMatchMessages(matchId);
                const unreadCount = matchMessages.filter(msg => 
                  msg.senderId !== 'current_user' && !msg.readAt
                ).length;

                return (
                  <Card 
                    key={matchId} 
                    padding="$4" 
                    backgroundColor={unreadCount > 0 ? "$blue2" : "$gray2"}
                    pressStyle={{ backgroundColor: "$gray4" }}
                  >
                    <YStack space="$3">
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack space="$1">
                          <Text fontWeight="bold">
                            Матч #{matchId.replace('match', '')}
                          </Text>
                          <Text fontSize="$3" color="$gray10">
                            {lastMessage?.createdAt.toLocaleDateString()}
                          </Text>
                        </YStack>
                        {unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text fontSize="$2" color="white" fontWeight="bold">
                              {unreadCount}
                            </Text>
                          </View>
                        )}
                      </XStack>
                      
                      <Text fontSize="$3" numberOfLines={2}>
                        {lastMessage?.content}
                      </Text>
                      
                      <Button
                        backgroundColor="$blue10"
                        color="white"
                        onPress={() => {
                          // Здесь будет навигация к конкретному чату
                          console.log('Открыть чат:', matchId);
                        }}
                      >
                        Открыть чат
                      </Button>
                    </YStack>
                  </Card>
                );
              })}
            </YStack>
          ) : (
            <YStack space="$4" padding="$8" alignItems="center">
              <Text fontSize="$6" fontWeight="bold" color="$gray10">
                Нет сообщений
              </Text>
              <Text textAlign="center" color="$gray10">
                Когда у вас появятся принятые матчи, здесь будут отображаться ваши чаты
              </Text>
            </YStack>
          )}

          {/* Демонстрация отправки сообщения */}
          {matchIds.length > 0 && (
            <Card padding="$4" backgroundColor="$gray2">
              <YStack space="$3">
                <Text fontWeight="bold">Отправить сообщение</Text>
                <XStack space="$3">
                  <Input
                    flex={1}
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                  />
                  <Button
                    backgroundColor="$blue10"
                    color="white"
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Отправить
                  </Button>
                </XStack>
              </YStack>
            </Card>
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
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
});
