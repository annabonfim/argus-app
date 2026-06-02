import axios from 'axios';
import { Platform } from 'react-native';

// iOS sim e Android emu resolvem sozinhos; device físico na WiFi seta
// EXPO_PUBLIC_API_URL (ex.: http://192.168.0.42:5215) sem editar este arquivo.
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.select({
    ios: 'http://localhost:5215',
    android: 'http://10.0.2.2:5215',
    default: 'http://localhost:5215',
  });

// O token (Bearer) e o interceptor de 401 são configurados pelo AuthContext.
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
