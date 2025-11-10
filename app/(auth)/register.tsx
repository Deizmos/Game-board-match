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
import { register } from '../../lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await register({ name, email, password });
      Alert.alert('Успех', 'Регистрация прошла успешно. Войдите в аккаунт.');
      router.replace('/(auth)/login');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Не удалось выполнить регистрацию';
      Alert.alert('Ошибка', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Регистрация</Text>
        <TextInput
          placeholder="Имя"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12
          }}
        />
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
        <Button title="Зарегистрироваться" onPress={onSubmit} disabled={loading} />
        {loading ? <ActivityIndicator /> : null}
        <Text>
          Уже есть аккаунт? <Link href="/(auth)/login">Войти</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}


