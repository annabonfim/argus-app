import axios from 'axios';

// Default = .NET na nuvem (Azure), pra o APK publicado funcionar pro professor.
// Pra dev local contra a .NET da sua máquina, sete EXPO_PUBLIC_API_URL
// (iOS sim: http://localhost:5215 · Android emu: http://10.0.2.2:5215).
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://argus-operations-rm559561.azurewebsites.net';

// O token (Bearer) e o interceptor de 401 são configurados pelo AuthContext.
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
