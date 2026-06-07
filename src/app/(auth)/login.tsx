import { useState } from 'react';
import {KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/api/errors';
import { colors, fonts, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      setError('Preencha email e senha.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn({ email: email.trim(), senha });
      // Navegação acontece sozinha: o token entra no estado e o Stack.Protected
      // troca pro grupo (protected).
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        onPress={() => router.push('/sobre')}
        hitSlop={8}
        style={styles.infoButton}
        accessibilityRole="button"
        accessibilityLabel="Sobre o app"
      >
        <Ionicons
          name="information-circle-outline"
          size={26}
          color={colors.olive}
        />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo variant="vertical" width={170} />
        </View>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="brig@argus.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextField
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button title="Entrar" onPress={handleLogin} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <Link href="/signup" style={styles.footerLink}>
              Cadastre-se
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  infoButton: {
    position: 'absolute',
    top: spacing.xxl + spacing.lg,
    right: spacing.xl,
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: { alignItems: 'center' },
  form: { gap: spacing.lg },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.olive,
  },
  footerLink: {
    ...typography.body,
    color: colors.fire,
    fontFamily: fonts.bodySemiBold,
  },
});
