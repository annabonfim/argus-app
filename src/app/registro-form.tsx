import { useEffect, useState } from 'react';
import {Alert,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Select, type SelectOption } from '@/components/Select';
import { listOcorrencias } from '@/api/ocorrencias';
import {createRegistro,deleteRegistro,getRegistro,updateRegistro,} from '@/api/registros';
import { getErrorMessage } from '@/api/errors';
import { getCurrentCoords } from '@/lib/location';
import { colors, fonts, spacing, typography } from '@/theme';

export default function RegistroFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, ocorrenciaId: ocorrenciaParam } = useLocalSearchParams<{
    id?: string;
    ocorrenciaId?: string;
  }>();
  const editing = typeof id === 'string';
  const registroId = editing ? Number(id) : null;
  // Quando aberto a partir do detalhe da ocorrência, ela já vem definida e
  // travada (sem picker) — registro nasce no contexto da ocorrência.
  const presetOcorrenciaId =
    typeof ocorrenciaParam === 'string' ? Number(ocorrenciaParam) : null;
  const lockOcorrencia = editing || presetOcorrenciaId !== null;

  const [ocorrencias, setOcorrencias] = useState<SelectOption<number>[]>([]);
  const [observacao, setObservacao] = useState('');
  const [ocorrenciaId, setOcorrenciaId] = useState<number | null>(
    presetOcorrenciaId,
  );
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [urlFoto, setUrlFoto] = useState('');
  const [dataRegistro, setDataRegistro] = useState<string | null>(null);

  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega as ocorrências (pro picker) e, se editando, o registro existente.
  useEffect(() => {
    (async () => {
      try {
        const lista = await listOcorrencias();
        setOcorrencias(
          lista.map((o) => ({
            value: o.id,
            label: `#${o.id} — ${o.descricao || 'sem descrição'}`,
          })),
        );
        if (registroId !== null) {
          const reg = await getRegistro(registroId);
          setObservacao(reg.observacao);
          setOcorrenciaId(reg.ocorrenciaId);
          setLatitude(String(reg.latitude));
          setLongitude(String(reg.longitude));
          setUrlFoto(reg.urlFoto);
          setDataRegistro(reg.dataRegistro);
        } else if (presetOcorrenciaId !== null) {
          // Registro novo a partir de uma ocorrência: herda a localização dela
          // como padrão (o brigadista troca pelo GPS se estiver em outro ponto).
          const oc = lista.find((o) => o.id === presetOcorrenciaId);
          if (oc) {
            setLatitude(String(oc.latitude));
            setLongitude(String(oc.longitude));
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitializing(false);
      }
    })();
  }, [registroId]);

  async function handleGps() {
    setGpsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentCoords();
      setLatitude(String(coords.latitude));
      setLongitude(String(coords.longitude));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGpsLoading(false);
    }
  }

  async function handleSave() {
    const lat = Number(latitude);
    const long = Number(longitude);
    if (ocorrenciaId === null) {
      setError('Selecione a ocorrência relacionada.');
      return;
    }
    if (!latitude || !longitude || Number.isNaN(lat) || Number.isNaN(long)) {
      setError('Informe a localização (use o GPS ou digite lat/long).');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = {
        observacao: observacao.trim(),
        urlFoto: urlFoto.trim(),
        latitude: lat,
        longitude: long,
        // Edição preserva a data original; criação carimba o momento atual.
        dataRegistro: dataRegistro ?? new Date().toISOString(),
        ocorrenciaId,
      };
      if (registroId !== null) {
        await updateRegistro(registroId, input);
      } else {
        await createRegistro(input);
      }
      Toast.show({
        type: 'success',
        text1: editing ? 'Registro atualizado' : 'Registro adicionado',
      });
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  function handleDelete() {
    if (registroId === null) return;
    Alert.alert('Excluir registro', 'Tem certeza? Esta ação é permanente.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteRegistro(registroId);
            Toast.show({ type: 'success', text1: 'Registro excluído' });
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
          {editing ? 'Editar registro' : 'Novo registro'}
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
          {lockOcorrencia ? (
            <View style={styles.readonly}>
              <Text style={styles.readonlyLabel}>Ocorrência</Text>
              <View style={styles.readonlyBox}>
                <Text style={styles.readonlyText}>
                  {ocorrencias.find((o) => o.value === ocorrenciaId)?.label ??
                    `#${ocorrenciaId}`}
                </Text>
              </View>
            </View>
          ) : (
            <Select
              label="Ocorrência"
              value={ocorrenciaId}
              options={ocorrencias}
              onChange={setOcorrenciaId}
              placeholder={
                ocorrencias.length
                  ? 'Selecione...'
                  : 'Nenhuma ocorrência cadastrada'
              }
            />
          )}
          <TextField
            label="Observação"
            value={observacao}
            onChangeText={setObservacao}
            placeholder="O que foi observado em campo"
          />

          <View style={styles.coordsRow}>
            <View style={styles.coordField}>
              <TextField
                label="Latitude"
                value={latitude}
                onChangeText={setLatitude}
                placeholder="-23.5505"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.coordField}>
              <TextField
                label="Longitude"
                value={longitude}
                onChangeText={setLongitude}
                placeholder="-46.6333"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <Button
            title="Usar minha localização"
            onPress={handleGps}
            loading={gpsLoading}
            variant="outline"
          />

          <TextField
            label="URL da foto (opcional)"
            value={urlFoto}
            onChangeText={setUrlFoto}
            placeholder="https://…"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={editing ? 'Salvar alterações' : 'Criar registro'}
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.title, color: colors.forest },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.olive },
  form: { padding: spacing.xl, gap: spacing.lg },
  coordsRow: { flexDirection: 'row', gap: spacing.md },
  coordField: { flex: 1 },
  error: {
    ...typography.caption,
    color: colors.danger,
    fontFamily: fonts.body,
  },
  readonly: { gap: spacing.xs },
  readonlyLabel: {
    ...typography.caption,
    color: colors.forest,
    fontFamily: fonts.bodySemiBold,
  },
  readonlyBox: {
    minHeight: 50,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.fireWarm,
  },
  readonlyText: { ...typography.body, color: colors.olive },
});
