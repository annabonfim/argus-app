import { Stack } from 'expo-router';

// Grupo público (login/signup). Sem header — cada tela desenha o próprio
// cabeçalho. login é a rota inicial do grupo.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
