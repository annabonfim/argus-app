import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

function RootNavigator() {
  const { token, isLoading } = useAuth();

  // Enquanto lê a sessão salva, segura numa tela de loading pra não piscar o
  // login pra quem já estava logado.
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.cream} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      {/* Sobre fica fora dos guards: acessível logado ou não (ícone na login). */}
      <Stack.Screen name="sobre" options={{ presentation: 'modal' }} />
      {/* Formulário de registro (criar/editar) — modal. */}
      <Stack.Screen name="registro-form" options={{ presentation: 'modal' }} />
      {/* Ocorrência: detalhe (push, header próprio) e formulário (modal). */}
      <Stack.Screen name="ocorrencia-detalhe" />
      <Stack.Screen name="ocorrencia-form" options={{ presentation: 'modal' }} />
      {/* Brigada: detalhe (push, com a equipe) e formulário (modal). */}
      <Stack.Screen name="brigada-detalhe" />
      <Stack.Screen name="brigada-form" options={{ presentation: 'modal' }} />
      {/* Brigadista: formulário (criar/editar) — modal, a partir do detalhe da brigada. */}
      <Stack.Screen name="brigadista-form" options={{ presentation: 'modal' }} />
      {/* Detalhe do alerta (push, header próprio). */}
      <Stack.Screen name="alerta-detalhe" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    Oswald_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Segura tudo até as fontes carregarem pra não renderizar com a fonte do
  // sistema e dar "flash" quando a Oswald/Inter entram.
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.cream} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
      {/* Toasts de feedback (sucesso/erro) renderizados acima de tudo. */}
      <Toast />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
});
