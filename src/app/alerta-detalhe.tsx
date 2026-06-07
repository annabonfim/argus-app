import { useCallback, useState } from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View,} from 'react-native';
import {useFocusEffect,useLocalSearchParams,useRouter} from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { getAlerta } from '@/api/alertas';
import { listarFocos } from '@/api/focos';
import { getErrorMessage } from '@/api/errors';
import { NIVEL_ALERTA_THEME, STATUS_ALERTA_LABEL } from '@/lib/labels';
import { formatCoords, formatDateTime } from '@/lib/format';
import { abrirMapa } from '@/lib/maps';
import { useAuth } from '@/context/AuthContext';
import {PerfilUsuario,type Alerta,type FocoCalor,} from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function AlertaDetalheScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alertaId = Number(id);

  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [foco, setFoco] = useState<FocoCalor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Promover alerta a ocorrência é restrito a Admin/Coordenador (403 pro resto).
  const podeCriar =
    user?.perfil === PerfilUsuario.Admin ||
    user?.perfil === PerfilUsuario.Coordenador;

  const load = useCallback(async () => {
    setError(null);
    try {
      const a = await getAlerta(alertaId);
      setAlerta(a);
      // O foco que gerou o alerta carrega as coordenadas (o alerta não tem).
      try {
        const focos = await listarFocos();
        setFoco(focos.find((f) => f.id === a.focoCalorId) ?? null);
      } catch {
        setFoco(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [alertaId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleCriarOcorrencia() {
    const params: {
      alertaId: string;
      latitude?: string;
      longitude?: string;
      descricao?: string;
    } = { alertaId: String(alertaId) };
    if (foco) {
      params.latitude = String(foco.latitude);
      params.longitude = String(foco.longitude);
    }
    // Pré-preenche a descrição com o contexto do alerta (o brigadista edita).
    if (alerta) {
      params.descricao = [alerta.titulo, alerta.recomendacaoOperacional]
        .filter(Boolean)
        .join(' — ');
    }
    router.push({ pathname: '/ocorrencia-form', params });
  }

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
        <Text style={styles.headerTitle}>Alerta #{alertaId}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.fire} />
        </View>
      ) : error || !alerta ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error ?? 'Alerta não encontrado.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Badge
            label={NIVEL_ALERTA_THEME[alerta.nivel].label}
            color={NIVEL_ALERTA_THEME[alerta.nivel].color}
          />
          <Text style={styles.titulo}>{alerta.titulo}</Text>
          {!!alerta.descricao && (
            <Text style={styles.descricao}>{alerta.descricao}</Text>
          )}

          {/* Recomendação operacional em destaque — é o que orienta a ação. */}
          {!!alerta.recomendacaoOperacional && (
            <View style={styles.recomendacao}>
              <View style={styles.recomendacaoHeader}>
                <Ionicons name="bulb-outline" size={18} color={colors.fire} />
                <Text style={styles.recomendacaoTitle}>
                  Recomendação operacional
                </Text>
              </View>
              <Text style={styles.recomendacaoText}>
                {alerta.recomendacaoOperacional}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Info
              label="Status"
              value={STATUS_ALERTA_LABEL[alerta.status]}
            />
            {alerta.scoreRisco != null && (
              <Info label="Score de risco" value={`${alerta.scoreRisco}/100`} />
            )}
            <Info label="Gerado" value={formatDateTime(alerta.dataGeracao)} />
            {alerta.dataAtualizacao && (
              <Info
                label="Atualizado"
                value={formatDateTime(alerta.dataAtualizacao)}
              />
            )}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Localização (foco)</Text>
              {foco ? (
                <Pressable
                  onPress={() =>
                    abrirMapa(foco.latitude, foco.longitude, alerta.titulo)
                  }
                  hitSlop={6}
                >
                  <Text style={styles.coordLink}>
                    {formatCoords(foco.latitude, foco.longitude)}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.fieldValue}>
                  Foco #{alerta.focoCalorId}
                </Text>
              )}
            </View>
          </View>

          {podeCriar && (
            <Button
              title="Gerar ocorrência"
              icon="add-circle-outline"
              variant="fire"
              onPress={handleCriarOcorrencia}
            />
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
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.subtitle,
    fontFamily: fonts.headingBold,
    color: colors.cream,
  },
  headerSpacer: { width: 26 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: { padding: spacing.xl, gap: spacing.lg },
  titulo: { ...typography.title, color: colors.forest },
  descricao: { ...typography.body, color: colors.olive },
  recomendacao: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.fire,
  },
  recomendacaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recomendacaoTitle: {
    ...typography.caption,
    fontFamily: fonts.bodySemiBold,
    color: colors.fire,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recomendacaoText: { ...typography.body, color: colors.forest },
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
  coordLink: {
    ...typography.body,
    color: colors.fire,
    textDecorationLine: 'underline',
  },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
