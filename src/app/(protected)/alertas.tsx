import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/Badge';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { listAlertas } from '@/api/alertas';
import { NIVEL_ALERTA_THEME, STATUS_ALERTA_LABEL } from '@/lib/labels';
import { formatRelative } from '@/lib/format';
import type { NivelAlerta } from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

// 'TODOS' + os níveis na ordem do mais crítico ao menos crítico (ordem de
// triagem: quem está apagando incêndio olha o topo primeiro).
type Filtro = NivelAlerta | 'TODOS';
const FILTROS: { key: Filtro; label: string; color: string }[] = [
  { key: 'TODOS', label: 'Todos', color: colors.forest },
  { key: 'CRITICO', ...NIVEL_ALERTA_THEME.CRITICO },
  { key: 'ALTO', ...NIVEL_ALERTA_THEME.ALTO },
  { key: 'MEDIO', ...NIVEL_ALERTA_THEME.MEDIO },
  { key: 'BAIXO', ...NIVEL_ALERTA_THEME.BAIXO },
];

export default function AlertasScreen() {
  const router = useRouter();
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listAlertas);
  const [filtro, setFiltro] = useState<Filtro>('TODOS');

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
    key === 'TODOS' ? data.length : data.filter((a) => a.nivel === key).length;

  const visiveis =
    filtro === 'TODOS' ? data : data.filter((a) => a.nivel === filtro);

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
            icon="alert-circle-outline"
            title={filtro === 'TODOS' ? 'Nenhum alerta' : 'Nenhum alerta aqui'}
            message={
              filtro === 'TODOS'
                ? 'Não há alertas reportados pelo satélite no momento.'
                : 'Nenhum alerta nesse nível de criticidade.'
            }
          />
        }
        renderItem={({ item }) => {
          const tema = NIVEL_ALERTA_THEME[item.nivel];
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: tema.color },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/alerta-detalhe',
                  params: { id: item.id.toString() },
                })
              }
            >
              <View style={styles.cardBody}>
                <Text style={styles.titulo} numberOfLines={2}>
                  {item.titulo}
                </Text>
                <View style={styles.metaRow}>
                  <Badge label={tema.label} color={tema.color} />
                  {item.scoreRisco != null && (
                    <Text style={styles.score}>Risco {item.scoreRisco}</Text>
                  )}
                  <Text style={styles.status}>
                    {STATUS_ALERTA_LABEL[item.status]}
                  </Text>
                </View>
                <Text style={styles.data}>
                  {formatRelative(item.dataGeracao)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.olive} />
            </Pressable>
          );
        }}
      />
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
  // flexGrow:0 impede a barra horizontal de esticar na vertical (senão os
  // chips viram ovais gigantes quando a lista é curta).
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
    borderLeftWidth: 4,
    backgroundColor: colors.creamLight,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.7 },
  cardBody: { flex: 1, gap: spacing.xs },
  titulo: {
    ...typography.body,
    fontFamily: fonts.bodySemiBold,
    color: colors.forest,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  score: {
    ...typography.caption,
    fontFamily: fonts.bodySemiBold,
    color: colors.forest,
  },
  status: { ...typography.caption, color: colors.olive },
  data: { ...typography.caption, color: colors.olive },
});
