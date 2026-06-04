import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Badge } from '@/components/Badge';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { listRecursos } from '@/api/recursos';
import { TIPO_RECURSO_LABEL } from '@/lib/labels';
import { colors, radius, spacing, typography } from '@/theme';

export default function RecursosScreen() {
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listRecursos);

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
          icon="cube-outline"
          title="Nenhum recurso"
          message="Ainda não há recursos cadastrados."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.tipo}>{TIPO_RECURSO_LABEL[item.tipo]}</Text>
          </View>
          <Badge
            label={item.disponivel ? 'Disponível' : 'Indisponível'}
            color={item.disponivel ? colors.success : colors.olive}
          />
        </View>
      )}
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
    backgroundColor: colors.creamLight,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardBody: { flex: 1, gap: 2 },
  nome: {
    ...typography.subtitle,
    color: colors.forest,
  },
  tipo: { ...typography.caption, color: colors.olive },
});
