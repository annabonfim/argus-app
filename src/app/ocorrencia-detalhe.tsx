import { useCallback, useState } from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams,useRouter} from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { getOcorrencia, updateOcorrencia } from '@/api/ocorrencias';
import { listRegistros } from '@/api/registros';
import { getBrigada } from '@/api/brigadas';
import { listBrigadistas } from '@/api/brigadistas';
import { getErrorMessage } from '@/api/errors';
import { useAuth } from '@/context/AuthContext';
import { statusOcorrenciaTheme } from '@/lib/labels';
import { formatCoords, formatDateTime } from '@/lib/format';
import { getEndereco } from '@/lib/location';
import { abrirMapa } from '@/lib/maps';
import {PerfilUsuario,StatusOcorrencia,type Brigadista,type Ocorrencia,type RegistroCampo} from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

const STATUS_OPTIONS = [
  StatusOcorrencia.Aberta,
  StatusOcorrencia.EmAtendimento,
  StatusOcorrencia.Controlada,
  StatusOcorrencia.Finalizada,
].map((s) => ({ value: s, label: statusOcorrenciaTheme[s].label }));

export default function OcorrenciaDetalheScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ocorrenciaId = Number(id);

  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null);
  const [registros, setRegistros] = useState<RegistroCampo[]>([]);
  const [brigadaNome, setBrigadaNome] = useState('');
  const [equipe, setEquipe] = useState<Brigadista[]>([]);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusSel, setStatusSel] = useState<StatusOcorrencia | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const o = await getOcorrencia(ocorrenciaId);
      const todos = await listRegistros();
      setOcorrencia(o);
      setStatusSel(o.status);
      setRegistros(todos.filter((r) => r.ocorrenciaId === ocorrenciaId));

      // Nome da brigada (cai no "#id" se a busca falhar).
      try {
        const brigada = await getBrigada(o.brigadaId);
        setBrigadaNome(brigada.nome);
      } catch {
        setBrigadaNome(`Brigada #${o.brigadaId}`);
      }
      // Equipe = brigadistas que pertencem à brigada da ocorrência.
      try {
        const todos = await listBrigadistas();
        setEquipe(todos.filter((b) => b.brigadaId === o.brigadaId));
      } catch {
        setEquipe([]);
      }

      // Endereço a partir das coordenadas (geocodificação reversa).
      setEndereco(await getEndereco(o.latitude, o.longitude));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [ocorrenciaId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSalvarStatus() {
    if (!ocorrencia || statusSel === null || statusSel === ocorrencia.status)
      return;
    setSavingStatus(true);
    setError(null);
    try {
      await updateOcorrencia(ocorrenciaId, {
        descricao: ocorrencia.descricao,
        latitude: ocorrencia.latitude,
        longitude: ocorrencia.longitude,
        status: statusSel,
        dataAbertura: ocorrencia.dataAbertura,
        dataFinalizacao:
          statusSel === StatusOcorrencia.Finalizada
            ? (ocorrencia.dataFinalizacao ?? new Date().toISOString())
            : null,
        brigadistaId: ocorrencia.brigadistaId,
        brigadaId: ocorrencia.brigadaId,
      });
      await load();
      Toast.show({ type: 'success', text1: 'Status atualizado' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Não foi possível atualizar', text2: getErrorMessage(err) });
    } finally {
      setSavingStatus(false);
    }
  }

  // Brigadista só registra na ocorrência da própria brigada (espelha o backend);
  // Admin/Coordenador sempre podem. `equipe` = brigadistas da brigada da ocorrência.
  const isAdminCoord =
    user?.perfil === PerfilUsuario.Admin ||
    user?.perfil === PerfilUsuario.Coordenador;
  const podeRegistrar =
    isAdminCoord ||
    (user?.brigadistaId != null &&
      equipe.some((b) => b.id === user.brigadistaId));

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={26} color={colors.cream} />
        </Pressable>
        <Text style={styles.headerTitle}>Ocorrência #{ocorrenciaId}</Text>
        {isAdminCoord ? (
          <Pressable
            onPress={() =>
              router.navigate(`/ocorrencia-form?id=${ocorrenciaId}`)
            }
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Editar ocorrência"
          >
            <Ionicons name="create-outline" size={15} color={colors.cream} />
            <Text style={styles.headerAction}>Editar</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.fire} />
        </View>
      ) : error || !ocorrencia ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error ?? 'Ocorrência não encontrada.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Badge
            label={statusOcorrenciaTheme[ocorrencia.status].label}
            color={statusOcorrenciaTheme[ocorrencia.status].bg}
          />
          <Text style={styles.desc}>
            {ocorrencia.descricao || 'Sem descrição'}
          </Text>

          {/* Fecha o ciclo: ocorrência originada de um alerta de satélite. */}
          {ocorrencia.alertaId != null && (
            <Pressable
              style={({ pressed }) => [
                styles.alertaChip,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.navigate({
                  pathname: '/alerta-detalhe',
                  params: { id: String(ocorrencia.alertaId) },
                })
              }
            >
              <Ionicons name="planet-outline" size={16} color={colors.fire} />
              <Text style={styles.alertaChipText}>
                Originada do alerta #{ocorrencia.alertaId}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.fire} />
            </Pressable>
          )}

          <View style={styles.card}>
            <Info
              label="Aberta em"
              value={formatDateTime(ocorrencia.dataAbertura)}
            />
            {ocorrencia.dataFinalizacao && (
              <Info
                label="Finalizada em"
                value={formatDateTime(ocorrencia.dataFinalizacao)}
              />
            )}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Localização</Text>
              <Pressable
                onPress={() =>
                  abrirMapa(
                    ocorrencia.latitude,
                    ocorrencia.longitude,
                    ocorrencia.descricao || 'Ocorrência',
                  )
                }
                hitSlop={6}
              >
                {endereco && <Text style={styles.fieldValue}>{endereco}</Text>}
                <Text style={styles.coordLink}>
                  {formatCoords(ocorrencia.latitude, ocorrencia.longitude)}
                </Text>
              </Pressable>
            </View>
            <Info label="Brigada" value={brigadaNome} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Brigadista{equipe.length > 1 ? 's' : ''}
              </Text>
              {equipe.length === 0 ? (
                <Text style={styles.fieldValue}>
                  Brigadista #{ocorrencia.brigadistaId}
                </Text>
              ) : (
                equipe.map((b) => (
                  <Text key={b.id} style={styles.fieldValue}>
                    {b.nome}
                    {b.id === ocorrencia.brigadistaId && (
                      <Text style={styles.responsavel}> · responsável</Text>
                    )}
                  </Text>
                ))
              )}
            </View>
          </View>

          {/* Atualizar status — só Admin/Coord ou brigadista da própria brigada.
              Escolhe e confirma no botão (não auto-salva). */}
          {podeRegistrar && (
            <View style={styles.statusBlock}>
              <Select
                label="Atualizar status"
                value={statusSel}
                options={STATUS_OPTIONS}
                onChange={setStatusSel}
              />
              {statusSel !== null && statusSel !== ocorrencia.status && (
                <Button
                  title="Salvar status"
                  onPress={handleSalvarStatus}
                  loading={savingStatus}
                  variant="fire"
                />
              )}
            </View>
          )}

          {/* Registros de campo desta ocorrência (nascem aqui, sem picker). */}
          <View style={styles.registrosHeader}>
            <Text style={styles.sectionTitle}>Registros de campo</Text>
            <Text style={styles.count}>{registros.length}</Text>
          </View>

          {registros.length === 0 ? (
            <Text style={styles.empty}>Nenhum registro ainda.</Text>
          ) : (
            registros.map((r) => (
              <Pressable
                key={r.id}
                style={({ pressed }) => [
                  styles.registroCard,
                  pressed && styles.pressed,
                ]}
                onPress={
                  podeRegistrar
                    ? () => router.navigate(`/registro-form?id=${r.id}`)
                    : undefined
                }
              >
                <View style={styles.registroBody}>
                  <Text style={styles.registroTitle} numberOfLines={1}>
                    {r.observacao || 'Sem observação'}
                  </Text>
                  <Text style={styles.registroMeta}>
                    {formatDateTime(r.dataRegistro)}
                  </Text>
                </View>
                {podeRegistrar && (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.olive}
                  />
                )}
              </Pressable>
            ))
          )}

          {podeRegistrar ? (
            <Button
              title="Adicionar registro"
              onPress={() =>
                router.navigate(`/registro-form?ocorrenciaId=${ocorrenciaId}`)
              }
              variant="outline"
            />
          ) : (
            <Text style={styles.empty}>
              Só a brigada responsável pode adicionar registros.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Campo da ficha: rótulo pequeno em cima, valor embaixo (tudo alinhado à esquerda).
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.subtitle,
    fontFamily: fonts.headingBold,
    color: colors.cream,
  },
  // Reserva o mesmo espaço do botão Editar pra manter o título centralizado
  // quando o usuário não tem permissão de editar (brigadista).
  headerSpacer: { width: 64 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editPressed: { opacity: 0.6 },
  headerAction: {
    ...typography.caption,
    fontFamily: fonts.bodySemiBold,
    color: colors.cream,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { padding: spacing.xl, gap: spacing.lg },
  desc: { ...typography.title, color: colors.forest },
  // Ficha: card sutil agrupando os campos, cada um com rótulo em cima.
  card: {
    backgroundColor: colors.creamLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: { gap: spacing.xs },
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
  alertaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.fire,
  },
  alertaChipText: {
    ...typography.caption,
    fontFamily: fonts.bodySemiBold,
    color: colors.fire,
  },
  responsavel: {
    ...typography.caption,
    color: colors.fire,
    fontFamily: fonts.bodyMedium,
  },
  coordLink: {
    ...typography.body,
    color: colors.fire,
    textDecorationLine: 'underline',
  },
  statusBlock: { gap: spacing.sm },
  registrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.fireWarm,
    paddingTop: spacing.lg,
  },
  sectionTitle: { ...typography.subtitle, color: colors.forest },
  count: {
    ...typography.caption,
    fontFamily: fonts.bodySemiBold,
    color: colors.cream,
    backgroundColor: colors.olive,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  empty: { ...typography.body, color: colors.olive },
  registroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.creamLight,
  },
  pressed: { opacity: 0.7 },
  registroBody: { flex: 1, gap: 2 },
  registroTitle: {
    ...typography.body,
    fontFamily: fonts.bodySemiBold,
    color: colors.forest,
  },
  registroMeta: { ...typography.caption, color: colors.olive },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
