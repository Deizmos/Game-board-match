import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { me } from '../lib/auth';

export default function Index() {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>(
    'loading'
  );

  useEffect(() => {
    (async () => {
      try {
        await me();
        setStatus('authed');
      } catch {
        setStatus('guest');
      }
    })();
  }, []);

  if (status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'authed') {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}


