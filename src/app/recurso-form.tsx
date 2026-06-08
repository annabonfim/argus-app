import { useEffect, useState } from 'react';
import {Alert,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Switch,Text,View} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Select, type SelectOption } from '@/components/Select';
import {createRecurso,deleteRecurso,getRecurso,updateRecurso} from '@/api/recursos';
import { getErrorMessage } from '@/api/errors';
import { TIPO_RECURSO_LABEL } from '@/lib/labels';
import { TipoRecurso } from '@/types/domain';
import { colors, fonts, spacing, typography } from '@/theme';

const TIPO_OPTIONS: SelectOption<TipoRecurso>[] = [
  TipoRecurso.Veiculo,
  TipoRecurso.Ferramenta,
  TipoRecurso.EPI,
  TipoRecurso.Comunicacao,
].map((t) => ({ value: t, label: TIPO_RECURSO_LABEL[t] }));

export default function RecursoFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // id = edição; brigadaId = brigada dona do recurso (vem do detalhe da brigada).
  const { id, brigadaId: brigadaParam } = useLocalSearchParams<{
    id?: string;
    brigadaId?: string;
  }>();
  const editing = typeof id === 'string';
  const recursoId = editing ? Number(id) : null;

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoRecurso>(TipoRecurso.Veiculo);
  const [disponivel, setDisponivel] = useState(true);
  const [brigadaId, setBrigadaId] = useState<number>(
    typeof brigadaParam === 'string' ? Number(brigadaParam) : 0,
  );

  const [initializing, setInitializing] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recursoId === null) return;
    (async () => {
      try {
        const r = await getRecurso(recursoId);
        setNome(r.nome);
        setTipo(r.tipo);
        setDisponivel(r.disponivel);
        setBrigadaId(r.brigadaId);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitializing(false);
      }
    })();
  }, [recursoId]);

  async function handleSave() {
    if (!nome.trim()) {
      setError('Informe o nome do recurso.');
      return;
    }
    if (!brigadaId) {
      setError('Recurso precisa estar vinculado a uma brigada.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = { nome: nome.trim(), tipo, disponivel, brigadaId };
      if (recursoId !== null) {
        await updateRecurso(recursoId, input);
      } else {
        await createRecurso(input);
      }
      Toast.show({
        type: 'success',
        text1: editing ? 'Recurso atualizado' : 'Recurso criado',
      });
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  function handleDelete() {
    if (recursoId === null) return;
    Alert.alert('Excluir recurso?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteRecurso(recursoId);
            Toast.show({ type: 'success', text1: 'Recurso excluído' });
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
          {editing ? 'Editar recurso' : 'Novo recurso'}
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
            placeholder="Caminhonete 4x4, abafador, rádio HT..."
          />
          <Select
            label="Tipo"
            value={tipo}
            options={TIPO_OPTIONS}
            onChange={setTipo}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Disponível</Text>
            <Switch
              value={disponivel}
              onValueChange={setDisponivel}
              trackColor={{ true: colors.success, false: colors.fireWarm }}
              thumbColor={colors.cream}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={editing ? 'Salvar alterações' : 'Criar recurso'}
            onPress={handleSave}
            loading={saving}
          />
          {editing && (
            <Button title="Excluir" onPress={handleDelete} variant="danger" />
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
