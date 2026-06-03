import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { TextField } from '@/components/TextField';
import { Select, type SelectOption } from '@/components/Select';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/api/errors';
import { maskTelefone } from '@/lib/format';
import { RELACOES_EMERGENCIA } from '@/lib/labels';
import { colors, fonts, spacing, typography } from '@/theme';

const RELACAO_OPCOES: SelectOption<string>[] = RELACOES_EMERGENCIA.map((r) => ({
  value: r,
  label: r,
}));

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeEmergencia, setNomeEmergencia] = useState('');
  const [telefoneEmergencia, setTelefoneEmergencia] = useState('');
  const [relacaoEmergencia, setRelacaoEmergencia] = useState('');
  const [senha, setSenha] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!nome.trim() || !email.trim() || !telefone.trim() || !senha || !codigoConvite.trim()) {
      setError('Preencha nome, email, telefone, senha e código de convite.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        // Campos de emergência são opcionais: só vão no payload se preenchidos.
        nomeEmergencia: nomeEmergencia.trim() || undefined,
        telefoneEmergencia: telefoneEmergencia.replace(/\D/g, '') || undefined,
        relacaoEmergencia: relacaoEmergencia.trim() || undefined,
        senha,
        codigoConvite: codigoConvite.trim(),
      });
      // Após cadastrar, o signUp já entra no app (token vem na resposta).
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo variant="horizontal" width={230} />
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.tagline}>Junte-se à brigada</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Nome"
            value={nome}
            onChangeText={setNome}
            placeholder="Maria Silva"
            autoCapitalize="words"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="maria@argus.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextField
            label="Telefone"
            value={telefone}
            onChangeText={(t) => setTelefone(maskTelefone(t))}
            placeholder="(11) 90000-0000"
            keyboardType="phone-pad"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato de emergência</Text>
            <Text style={styles.sectionHint}>Opcional</Text>
          </View>
          <TextField
            label="Nome do contato"
            value={nomeEmergencia}
            onChangeText={setNomeEmergencia}
            placeholder="João Silva"
            autoCapitalize="words"
          />
          <TextField
            label="Telefone do contato"
            value={telefoneEmergencia}
            onChangeText={(t) => setTelefoneEmergencia(maskTelefone(t))}
            placeholder="(11) 90000-0000"
            keyboardType="phone-pad"
          />
          <Select
            label="Relação (parentesco)"
            value={relacaoEmergencia || null}
            options={RELACAO_OPCOES}
            onChange={setRelacaoEmergencia}
            placeholder="Selecione..."
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acesso</Text>
          </View>
          <TextField
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="mínimo 6 caracteres"
            secureTextEntry
          />
          <TextField
            label="Código de convite"
            value={codigoConvite}
            onChangeText={setCodigoConvite}
            placeholder="ARGUS-2026"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title="Cadastrar"
            onPress={handleSignup}
            loading={loading}
            variant="fire"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <Link href="/login" style={styles.footerLink}>
              Entrar
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  header: { alignItems: 'center', gap: spacing.sm },
  title: {
    ...typography.title,
    fontSize: 28,
    color: colors.forest,
  },
  tagline: {
    ...typography.body,
    color: colors.olive,
    marginTop: -spacing.xs,
  },
  form: { gap: spacing.lg },
  section: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.fireWarm,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.forest,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.olive,
  },
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
