import { useEffect, useState } from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,View} from 'react-native';
import Toast from 'react-native-toast-message';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Select, type SelectOption } from '@/components/Select';
import { useAuth } from '@/context/AuthContext';
import { atualizarPerfil } from '@/api/auth';
import { getBrigadista } from '@/api/brigadistas';
import { getBrigada } from '@/api/brigadas';
import { getErrorMessage } from '@/api/errors';
import { maskTelefone } from '@/lib/format';
import { PERFIL_LABEL, RELACOES_EMERGENCIA } from '@/lib/labels';
import { colors, fonts, radius, spacing, typography } from '@/theme';

const RELACAO_OPCOES: SelectOption<string>[] = RELACOES_EMERGENCIA.map((r) => ({
  value: r,
  label: r,
}));

export default function PerfilScreen() {
  const { user, updateUser, signOut } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? '');
  const [telefone, setTelefone] = useState(maskTelefone(user?.telefone ?? ''));
  const [nomeEmergencia, setNomeEmergencia] = useState(
    user?.nomeEmergencia ?? '',
  );
  const [telefoneEmergencia, setTelefoneEmergencia] = useState(
    maskTelefone(user?.telefoneEmergencia ?? ''),
  );
  const [relacaoEmergencia, setRelacaoEmergencia] = useState(
    user?.relacaoEmergencia ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brigadaNome, setBrigadaNome] = useState<string | null>(null);

  // Brigada do usuário (só brigadistas têm): brigadistaId → brigada → nome.
  useEffect(() => {
    const bid = user?.brigadistaId;
    if (bid == null) return;
    (async () => {
      try {
        const b = await getBrigadista(bid);
        const brigada = await getBrigada(b.brigadaId);
        setBrigadaNome(brigada.nome);
      } catch {
        // best-effort: se falhar, só não mostra a brigada.
      }
    })();
  }, [user?.brigadistaId]);

  async function handleSave() {
    if (!user) return;
    if (!nome.trim() || !telefone.trim()) {
      setError('Preencha nome e telefone.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = {
        nome: nome.trim(),
        // Guarda só os dígitos (a exibição reformata em todo lugar).
        telefone: telefone.replace(/\D/g, ''),
        nomeEmergencia: nomeEmergencia.trim() || undefined,
        telefoneEmergencia: telefoneEmergencia.replace(/\D/g, '') || undefined,
        relacaoEmergencia: relacaoEmergencia.trim() || undefined,
      };
      await atualizarPerfil(input);
      // Atualiza o usuário em memória/cache com os novos valores.
      await updateUser({
        ...user,
        nome: input.nome,
        telefone: input.telefone,
        nomeEmergencia: input.nomeEmergencia ?? null,
        telefoneEmergencia: input.telefoneEmergencia ?? null,
        relacaoEmergencia: input.relacaoEmergencia ?? null,
      });
      Toast.show({ type: 'success', text1: 'Perfil atualizado' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Identidade — não editável aqui (email/perfil são controlados pelo admin). */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <Text style={styles.fieldValue}>{user?.nome}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.email}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Perfil</Text>
            {user && (
              <Badge label={PERFIL_LABEL[user.perfil]} color={colors.olive} />
            )}
          </View>
          {brigadaNome && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Brigada</Text>
              <Text style={styles.fieldValue}>{brigadaNome}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus dados</Text>
        </View>
        <TextField
          label="Nome"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
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

        {error && <Text style={styles.error}>{error}</Text>}

        <Button title="Salvar alterações" onPress={handleSave} loading={saving} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
        </View>
        <Button title="Sair" variant="outline" onPress={signOut} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.xl, gap: spacing.lg },
  card: {
    backgroundColor: colors.creamLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: { gap: spacing.xs, alignItems: 'flex-start' },
  fieldLabel: {
    ...typography.caption,
    color: colors.olive,
    fontFamily: fonts.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    ...typography.body,
    color: colors.forest,
    fontFamily: fonts.bodySemiBold,
  },
  section: {
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.fireWarm,
    paddingBottom: spacing.xs,
  },
  sectionTitle: { ...typography.subtitle, color: colors.forest },
  error: {
    ...typography.caption,
    color: colors.danger,
    fontFamily: fonts.body,
  },
});
