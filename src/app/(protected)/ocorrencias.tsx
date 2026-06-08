import { useState } from 'react';
import {ActivityIndicator,FlatList,Pressable,RefreshControl,ScrollView,StyleSheet,Text,View} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/Badge';
import { Fab } from '@/components/Fab';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { useAuth } from '@/context/AuthContext';
import { listOcorrencias } from '@/api/ocorrencias';
import { PerfilUsuario, StatusOcorrencia } from '@/types/domain';
import { statusOcorrenciaTheme } from '@/lib/labels';
import { formatCoords, formatDateTime } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/theme';

// 'TODAS' + os status na ordem do ciclo de vida da ocorrência.
type Filtro = StatusOcorrencia | 'TODAS';
const FILTROS: { key: Filtro; label: string; color: string }[] = [
  { key: 'TODAS', label: 'Todas', color: colors.forest },
  ...[
    StatusOcorrencia.Aberta,
    StatusOcorrencia.EmAtendimento,
    StatusOcorrencia.Controlada,
    StatusOcorrencia.Finalizada,
  ].map((s) => ({
    key: s as Filtro,
    label: statusOcorrenciaTheme[s].label,
    color: statusOcorrenciaTheme[s].bg,
  })),
];

export default function OcorrenciasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listOcorrencias);
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  // Brigadista não cria ocorrência (POST é Admin/Coordenador no backend).
  const podeCriar =
    user?.perfil === PerfilUsuario.Admin ||
    user?.perfil === PerfilUsuario.Coordenador;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.fire} />
      </View>
    );
  }

  if (error) {
    return (
      <ScreenPlaceholder
        icon="cloud-offline-outline"
        title="Não foi possível carregar"
        message={error}
      />
    );
  }

  const contar = (key: Filtro) =>
    key === 'TODAS' ? data.length : data.filter((o) => o.status === key).length;

  // Mais recentes primeiro (por data de abertura); os chips só filtram.
  const visiveis = (filtro === 'TODAS' ? data : data.filter((o) => o.status === filtro))
    .slice()
    .sort((a, b) => +new Date(b.dataAbertura) - +new Date(a.dataAbertura));

  return (
    <View style={styles.screen}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTROS.map(({ key, label, color }) => {
          const ativo = filtro === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFiltro(key)}
              style={[
                styles.chip,
                ativo && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text style={[styles.chipLabel, ativo && styles.chipActiveText]}>
                {label}
              </Text>
              <Text style={[styles.chipCount, ativo && styles.chipActiveText]}>
                {contar(key)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <ScreenPlaceholder
            icon="flame-outline"
            title={
              filtro === 'TODAS' ? 'Nenhuma ocorrência' : 'Nenhuma ocorrência aqui'
            }
            message={
              filtro === 'TODAS'
                ? 'Ainda não há ocorrências registradas.'
                : 'Nenhuma ocorrência nesse status.'
            }
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.navigate(`/ocorrencia-detalhe?id=${item.id}`)}
          >
            <View style={styles.cardBody}>
              <Badge
                label={statusOcorrenciaTheme[item.status].label}
                color={statusOcorrenciaTheme[item.status].bg}
              />
              <Text style={styles.desc} numberOfLines={2}>
                {item.descricao || 'Sem descrição'}
              </Text>
              <Text style={styles.meta}>
                {formatDateTime(item.dataAbertura)} ·{' '}
                {formatCoords(item.latitude, item.longitude)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.olive} />
          </Pressable>
        )}
      />
      {podeCriar && (
        <Fab
          icon="add"
          label="Nova ocorrência"
          onPress={() => router.navigate('/ocorrencia-form')}
          accessibilityLabel="Nova ocorrência"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  filterBar: { flexGrow: 0 },
  filterBarContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.fireWarm,
    backgroundColor: colors.creamLight,
  },
  chipLabel: {
    ...typography.caption,
    fontFamily: fonts.bodySemiBold,
    color: colors.forest,
  },
  chipCount: { ...typography.caption, color: colors.olive },
  chipActiveText: { color: colors.cream },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLight,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.7 },
  cardBody: { flex: 1, gap: spacing.xs },
  desc: {
    ...typography.body,
    fontFamily: fonts.bodySemiBold,
    color: colors.forest,
  },
  meta: { ...typography.caption, color: colors.olive },
});
