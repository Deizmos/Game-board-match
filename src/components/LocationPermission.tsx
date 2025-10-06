import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { YStack, Text, Button, Card } from 'tamagui';
import { useLocationStore } from '@/store/locationStore';

interface LocationPermissionProps {
  onPermissionGranted?: () => void;
}

export default function LocationPermission({ onPermissionGranted }: LocationPermissionProps) {
  const { requestPermission, permissionGranted, error } = useLocationStore();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted && onPermissionGranted) {
      onPermissionGranted();
    } else if (!granted) {
      Alert.alert(
        'Разрешение на геолокацию',
        'Для поиска игроков поблизости необходимо разрешение на геолокацию. Пожалуйста, разрешите доступ к местоположению в настройках приложения.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Настройки', onPress: () => {
            // Здесь можно добавить открытие настроек приложения
            console.log('Открыть настройки');
          }},
        ]
      );
    }
  };

  if (permissionGranted) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Card padding="$6" backgroundColor="$blue1" borderColor="$blue5">
        <YStack space="$4" alignItems="center">
          <Text fontSize="$6" fontWeight="600" color="$blue10" textAlign="center">
            Разрешение на геолокацию
          </Text>
          
          <Text color="$blue10" textAlign="center" lineHeight="$1">
            Для поиска игроков поблизости нам нужно знать ваше местоположение. 
            Это поможет найти других игроков в вашем городе.
          </Text>

          {error && (
            <Text color="$red10" textAlign="center" fontSize="$3">
              {error}
            </Text>
          )}

          <Button
            onPress={handleRequestPermission}
            backgroundColor="$blue10"
            color="white"
            size="$4"
          >
            Разрешить геолокацию
          </Button>

          <Text color="$blue8" textAlign="center" fontSize="$2">
            Ваши данные остаются приватными и не передаются третьим лицам
          </Text>
        </YStack>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
