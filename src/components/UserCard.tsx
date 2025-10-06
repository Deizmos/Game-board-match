import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, YStack, Text, XStack, Avatar, Button } from 'tamagui';
import { User } from '@/types';
import { SKILL_LEVELS, PLAY_STYLES } from '@/constants';

interface UserCardProps {
  user: User;
  onLike: (user: User) => void;
  onPass: (user: User) => void;
  onPress?: (user: User) => void;
  showActions?: boolean;
}

export default function UserCard({
  user,
  onLike,
  onPass,
  onPress,
  showActions = true,
}: UserCardProps) {
  const getSkillLevelLabel = (level: string) => {
    return SKILL_LEVELS.find(l => l.value === level)?.label || level;
  };

  const getPlayStyleLabels = (styles: string[]) => {
    return styles.map(style => 
      PLAY_STYLES.find(s => s.value === style)?.label || style
    ).join(', ');
  };

  return (
    <Card
      padding="$4"
      backgroundColor="$gray1"
      pressStyle={{ scale: 0.98 }}
      onPress={() => onPress?.(user)}
    >
      <YStack space="$3">
        <XStack space="$3" alignItems="center">
          <Avatar circular size="$6">
            <Avatar.Image source={{ uri: user.avatar || 'https://via.placeholder.com/100' }} />
            <Avatar.Fallback backgroundColor="$blue5">
              <Text color="$blue10">{user.name[0]}</Text>
            </Avatar.Fallback>
          </Avatar>
          
          <YStack flex={1}>
            <Text fontSize="$5" fontWeight="600">
              {user.name}, {user.age}
            </Text>
            <Text color="$gray10" fontSize="$3">
              {user.location.city || 'Местоположение не указано'}
            </Text>
            {user.isOnline && (
              <Text color="$green10" fontSize="$2">
                В сети
              </Text>
            )}
          </YStack>
        </XStack>

        {user.bio && (
          <Text color="$gray10" fontSize="$3" lineHeight="$1">
            {user.bio}
          </Text>
        )}

        {user.gamePreferences && user.gamePreferences.length > 0 && (
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="600" color="$blue10">
              Любимые игры:
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {user.gamePreferences.slice(0, 3).map((pref) => (
                <Card key={pref.id} padding="$2" backgroundColor="$blue2">
                  <Text fontSize="$2" color="$blue10">
                    {pref.gameName}
                  </Text>
                </Card>
              ))}
              {user.gamePreferences.length > 3 && (
                <Card padding="$2" backgroundColor="$gray3">
                  <Text fontSize="$2" color="$gray10">
                    +{user.gamePreferences.length - 3} еще
                  </Text>
                </Card>
              )}
            </XStack>
          </YStack>
        )}

        {user.gamePreferences && user.gamePreferences.length > 0 && (
          <YStack space="$1">
            <Text fontSize="$3" color="$gray10">
              Уровень: {getSkillLevelLabel(user.gamePreferences[0].skillLevel)}
            </Text>
            <Text fontSize="$3" color="$gray10">
              Стиль: {getPlayStyleLabels(user.gamePreferences[0].playStyle)}
            </Text>
          </YStack>
        )}

        {showActions && (
          <XStack space="$3" justifyContent="center" marginTop="$2">
            <Button
              onPress={() => onPass(user)}
              backgroundColor="$red5"
              color="$red10"
              flex={1}
              size="$3"
            >
              Пропустить
            </Button>
            <Button
              onPress={() => onLike(user)}
              backgroundColor="$green5"
              color="$green10"
              flex={1}
              size="$3"
            >
              Лайк
            </Button>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
