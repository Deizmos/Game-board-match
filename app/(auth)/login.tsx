import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  Text,
  TextInput,
  View
} from 'react-native';
import { login } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Не удалось выполнить вход';
      Alert.alert('Ошибка', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Вход</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12
          }}
        />
        <TextInput
          placeholder="Пароль"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12
          }}
        />
        <Button title="Войти" onPress={onSubmit} disabled={loading} />
        {loading ? <ActivityIndicator /> : null}
        <Text>
          Нет аккаунта? <Link href="/(auth)/register">Зарегистрироваться</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}


