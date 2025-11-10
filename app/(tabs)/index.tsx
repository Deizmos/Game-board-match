import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';
import { me, logout } from '../../lib/auth';
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await me();
        setUser(u);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Главная</Text>
      {user ? <Text>Привет, {user?.name || user?.email}</Text> : null}
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <View style={{ height: 16 }} />
      <Button
        title="Выйти"
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
