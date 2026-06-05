import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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
import { colors, fonts, radius, spacing, typography } from '@/theme';

export default function AlertasScreen() {
  const router = useRouter();
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listAlertas);

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

  return (
    <FlatList
      style={styles.screen}
      data={data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      ListEmptyComponent={
        <ScreenPlaceholder
          icon="alert-circle-outline"
          title="Nenhum alerta"
          message="Não há alertas reportados pelo satélite no momento."
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
              <Text style={styles.data}>{formatRelative(item.dataGeracao)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.olive} />
          </Pressable>
        );
      }}
    />
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
