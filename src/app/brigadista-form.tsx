import { useEffect, useState } from 'react';
import {Alert,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Switch,Text,View} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import {createBrigadista,deleteBrigadista,getBrigadista,updateBrigadista} from '@/api/brigadistas';
import { getErrorMessage } from '@/api/errors';
import { maskTelefone } from '@/lib/format';
import { colors, fonts, spacing, typography } from '@/theme';

export default function BrigadistaFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // id = edição; brigadaId = a brigada à qual o brigadista pertence (vem do
  // detalhe da brigada ao criar).
  const { id, brigadaId: brigadaIdParam } = useLocalSearchParams<{
    id?: string;
    brigadaId?: string;
  }>();
  const editing = typeof id === 'string';
  const brigadistaId = editing ? Number(id) : null;

  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [funcao, setFuncao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [brigadaId, setBrigadaId] = useState<number>(
    typeof brigadaIdParam === 'string' ? Number(brigadaIdParam) : 0,
  );
  const [dataAdmissao, setDataAdmissao] = useState<string | null>(null);

  const [initializing, setInitializing] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brigadistaId === null) return;
    (async () => {
      try {
        const b = await getBrigadista(brigadistaId);
        setNome(b.nome);
        setMatricula(b.matricula);
        setEmail(b.email);
        setTelefone(maskTelefone(b.telefone));
        setFuncao(b.funcao);
        setAtivo(b.ativo);
        setBrigadaId(b.brigadaId);
        setDataAdmissao(b.dataAdmissao);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitializing(false);
      }
    })();
  }, [brigadistaId]);

  async function handleSave() {
    if (!nome.trim() || !matricula.trim()) {
      setError('Preencha nome e matrícula.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = {
        nome: nome.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        funcao: funcao.trim(),
        ativo,
        dataAdmissao: dataAdmissao ?? new Date().toISOString(),
        brigadaId,
      };
      if (brigadistaId !== null) {
        await updateBrigadista(brigadistaId, input);
      } else {
        await createBrigadista(input);
      }
      Toast.show({
        type: 'success',
        text1: editing ? 'Brigadista atualizado' : 'Brigadista adicionado',
      });
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  function handleDelete() {
    if (brigadistaId === null) return;
    Alert.alert('Remover brigadista?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteBrigadista(brigadistaId);
            Toast.show({ type: 'success', text1: 'Brigadista removido' });
            router.back();
          } catch (err) {
            setError(getErrorMessage(err));
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>
          {editing ? 'Editar brigadista' : 'Novo brigadista'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        >
          <Ionicons name="close" size={28} color={colors.forest} />
        </Pressable>
      </View>

      {initializing ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Carregando…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Nome"
            value={nome}
            onChangeText={setNome}
            placeholder="Maria Silva"
            autoCapitalize="words"
          />
          <TextField
            label="Matrícula"
            value={matricula}
            onChangeText={setMatricula}
            placeholder="BRG-PT-001"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TextField
            label="Função"
            value={funcao}
            onChangeText={setFuncao}
            placeholder="Líder de esquadrão, brigadista florestal..."
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
            placeholder="(67) 99988-7766"
            keyboardType="phone-pad"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Ativo</Text>
            <Switch
              value={ativo}
              onValueChange={setAtivo}
              trackColor={{ true: colors.success, false: colors.fireWarm }}
              thumbColor={colors.cream}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={editing ? 'Salvar alterações' : 'Adicionar brigadista'}
            onPress={handleSave}
            loading={saving}
          />
          {editing && (
            <Button title="Remover" onPress={handleDelete} variant="danger" />
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.title, color: colors.forest },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.olive },
  form: { padding: spacing.xl, gap: spacing.lg },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    ...typography.body,
    color: colors.forest,
    fontFamily: fonts.bodySemiBold,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    fontFamily: fonts.body,
  },
});
