import api, { saveTokens, clearTokens } from './api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await api.post('/auth/login', payload);
  const { accessToken, refreshToken } = data;
  await saveTokens({ accessToken, refreshToken });
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    await clearTokens();
  }
}


