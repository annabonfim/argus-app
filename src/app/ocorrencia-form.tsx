import { useEffect, useState } from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,View,} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Select, type SelectOption } from '@/components/Select';
import {createOcorrencia,deleteOcorrencia,getOcorrencia,updateOcorrencia} from '@/api/ocorrencias';
import { listBrigadistas } from '@/api/brigadistas';
import { listBrigadas } from '@/api/brigadas';
import { criarOcorrenciaDeAlerta } from '@/api/alertas';
import { getErrorMessage } from '@/api/errors';
import { getCurrentCoords } from '@/lib/location';
import { STATUS_OCORRENCIA_LABEL } from '@/lib/labels';
import { useAuth } from '@/context/AuthContext';
import { PerfilUsuario, StatusOcorrencia, type Brigadista } from '@/types/domain';
import { colors, fonts, spacing, typography } from '@/theme';

const STATUS_OPTIONS: SelectOption<StatusOcorrencia>[] = [
  StatusOcorrencia.Aberta,
  StatusOcorrencia.EmAtendimento,
  StatusOcorrencia.Controlada,
  StatusOcorrencia.Finalizada,
].map((s) => ({ value: s, label: STATUS_OCORRENCIA_LABEL[s] }));

export default function OcorrenciaFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const podeExcluir =
    user?.perfil === PerfilUsuario.Admin ||
    user?.perfil === PerfilUsuario.Coordenador;
  // id = edição. latitude/longitude/alertaId = prefill quando aberto a partir
  // de um foco de satélite (tela Focos).
  const {
    id,
    latitude: latParam,
    longitude: lngParam,
    alertaId: alertaParam,
    descricao: descricaoParam,
  } = useLocalSearchParams<{
    id?: string;
    latitude?: string;
    longitude?: string;
    alertaId?: string;
    descricao?: string;
  }>();
  const editing = typeof id === 'string';
  const ocorrenciaId = editing ? Number(id) : null;

  const [brigadistas, setBrigadistas] = useState<Brigadista[]>([]);
  const [brigadas, setBrigadas] = useState<SelectOption<number>[]>([]);
  const [descricao, setDescricao] = useState(
    typeof descricaoParam === 'string' ? descricaoParam : '',
  );
  const [status, setStatus] = useState<StatusOcorrencia>(
    StatusOcorrencia.Aberta,
  );
  const [latitude, setLatitude] = useState(
    typeof latParam === 'string' ? latParam : '',
  );
  const [longitude, setLongitude] = useState(
    typeof lngParam === 'string' ? lngParam : '',
  );
  const [brigadistaId, setBrigadistaId] = useState<number | null>(null);
  const [brigadaId, setBrigadaId] = useState<number | null>(null);
  const [dataAbertura, setDataAbertura] = useState<string | null>(null);
  const [dataFinalizacao, setDataFinalizacao] = useState<string | null>(null);
  const [alertaId, setAlertaId] = useState<number | null>(
    typeof alertaParam === 'string' ? Number(alertaParam) : null,
  );

  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [bgts, bgds] = await Promise.all([
          listBrigadistas(),
          listBrigadas(),
        ]);
        setBrigadistas(bgts);
        setBrigadas(
          bgds.map((b) => ({ value: b.id, label: `#${b.id} — ${b.nome}` })),
        );
        if (ocorrenciaId !== null) {
          const o = await getOcorrencia(ocorrenciaId);
          setDescricao(o.descricao);
          setStatus(o.status);
          setLatitude(String(o.latitude));
          setLongitude(String(o.longitude));
          setBrigadistaId(o.brigadistaId);
          setBrigadaId(o.brigadaId);
          setDataAbertura(o.dataAbertura);
          setDataFinalizacao(o.dataFinalizacao);
          setAlertaId(o.alertaId);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitializing(false);
      }
    })();
  }, [ocorrenciaId]);

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

  // Brigada → Brigadista em cascata: ao trocar a brigada, limpa o brigadista
  // se ele não pertencer mais à brigada selecionada.
  function handleBrigadaChange(novaBrigadaId: number) {
    setBrigadaId(novaBrigadaId);
    const atual = brigadistas.find((b) => b.id === brigadistaId);
    if (!atual || atual.brigadaId !== novaBrigadaId) {
      setBrigadistaId(null);
    }
  }

  // Só os brigadistas da brigada selecionada aparecem no dropdown.
  const brigadistaOptions: SelectOption<number>[] =
    brigadaId === null
      ? []
      : brigadistas
          .filter((b) => b.brigadaId === brigadaId)
          .map((b) => ({ value: b.id, label: `#${b.id} — ${b.nome}` }));

  async function handleSave() {
    const lat = Number(latitude);
    const long = Number(longitude);
    if (!latitude || !longitude || Number.isNaN(lat) || Number.isNaN(long)) {
      setError('Informe a localização (use o GPS ou digite lat/long).');
      return;
    }
    if (brigadistaId === null || brigadaId === null) {
      setError('Selecione o brigadista e a brigada responsáveis.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = {
        descricao: descricao.trim(),
        latitude: lat,
        longitude: long,
        status,
        dataAbertura: dataAbertura ?? new Date().toISOString(),
        // Finaliza automaticamente quando o status vira Finalizada.
        dataFinalizacao:
          status === StatusOcorrencia.Finalizada
            ? (dataFinalizacao ?? new Date().toISOString())
            : null,
        brigadistaId,
        brigadaId,
        alertaId,
      };
      if (ocorrenciaId !== null) {
        await updateOcorrencia(ocorrenciaId, input);
      } else if (alertaId !== null) {
        // Origem: alerta de satélite. O backend gera a descrição (se vazia) e
        // já preenche o alertaId na ocorrência criada.
        await criarOcorrenciaDeAlerta(alertaId, {
          brigadaId,
          brigadistaId,
          latitude: lat,
          longitude: long,
          descricao: descricao.trim() || undefined,
        });
      } else {
        await createOcorrencia(input);
      }
      Toast.show({
        type: 'success',
        text1: editing ? 'Ocorrência atualizada' : 'Ocorrência criada',
      });
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  function handleDelete() {
    if (ocorrenciaId === null) return;
    Alert.alert('Excluir ocorrência?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteOcorrencia(ocorrenciaId);
            Toast.show({ type: 'success', text1: 'Ocorrência excluída' });
            // Volta duas telas: fecha o form e o detalhe da ocorrência excluída.
            router.back();
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
          {editing ? 'Editar ocorrência' : 'Nova ocorrência'}
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
            label="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição do foco de incêndio"
          />
          <Select
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
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

          <Select
            label="Brigada responsável"
            value={brigadaId}
            options={brigadas}
            onChange={handleBrigadaChange}
            placeholder={
              brigadas.length ? 'Selecione...' : 'Nenhuma brigada cadastrada'
            }
          />
          <Select
            label="Brigadista responsável"
            value={brigadistaId}
            options={brigadistaOptions}
            onChange={setBrigadistaId}
            disabled={brigadaId === null}
            placeholder={
              brigadaId === null
                ? 'Escolha a brigada primeiro'
                : brigadistaOptions.length
                  ? 'Selecione...'
                  : 'Nenhum brigadista nesta brigada'
            }
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={editing ? 'Salvar alterações' : 'Criar ocorrência'}
            onPress={handleSave}
            loading={saving}
          />
          {editing && podeExcluir && (
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
  coordsRow: { flexDirection: 'row', gap: spacing.md },
  coordField: { flex: 1 },
  error: {
    ...typography.caption,
    color: colors.danger,
    fontFamily: fonts.body,
  },
});
