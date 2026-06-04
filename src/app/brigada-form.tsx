import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import {
  createBrigada,
  deleteBrigada,
  getBrigada,
  updateBrigada,
} from '@/api/brigadas';
import { getErrorMessage } from '@/api/errors';
import { maskTelefone } from '@/lib/format';
import { colors, fonts, spacing, typography } from '@/theme';

export default function BrigadaFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = typeof id === 'string';
  const brigadaId = editing ? Number(id) : null;

  const [nome, setNome] = useState('');
  const [baseOperacional, setBaseOperacional] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ativa, setAtiva] = useState(true);

  const [initializing, setInitializing] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brigadaId === null) return;
    (async () => {
      try {
        const b = await getBrigada(brigadaId);
        setNome(b.nome);
        setBaseOperacional(b.baseOperacional);
        setTelefone(maskTelefone(b.telefone));
        setAtiva(b.ativa);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitializing(false);
      }
    })();
  }, [brigadaId]);

  async function handleSave() {
    if (!nome.trim()) {
      setError('Informe o nome da brigada.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = {
        nome: nome.trim(),
        baseOperacional: baseOperacional.trim(),
        telefone: telefone.replace(/\D/g, ''),
        ativa,
      };
      if (brigadaId !== null) {
        await updateBrigada(brigadaId, input);
      } else {
        await createBrigada(input);
      }
      Toast.show({
        type: 'success',
        text1: editing ? 'Brigada atualizada' : 'Brigada criada',
      });
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  function handleDelete() {
    if (brigadaId === null) return;
    Alert.alert('Excluir brigada?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteBrigada(brigadaId);
            Toast.show({ type: 'success', text1: 'Brigada excluída' });
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
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>
          {editing ? 'Editar brigada' : 'Nova brigada'}
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
            placeholder="Brigada Argus Pantanal Norte"
            autoCapitalize="words"
          />
          <TextField
            label="Base operacional"
            value={baseOperacional}
            onChangeText={setBaseOperacional}
            placeholder="Corumbá, MS"
          />
          <TextField
            label="Telefone"
            value={telefone}
            onChangeText={(t) => setTelefone(maskTelefone(t))}
            placeholder="(67) 3231-1234"
            keyboardType="phone-pad"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Ativa</Text>
            <Switch
              value={ativa}
              onValueChange={setAtiva}
              trackColor={{ true: colors.success, false: colors.fireWarm }}
              thumbColor={colors.cream}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={editing ? 'Salvar alterações' : 'Criar brigada'}
            onPress={handleSave}
            loading={saving}
          />
          {editing && (
            <Button title="Excluir" onPress={handleDelete} variant="danger" />
          )}
        </ScrollView>
      )}
    </View>
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
