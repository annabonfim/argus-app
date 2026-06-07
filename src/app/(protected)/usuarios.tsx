import {ActivityIndicator,FlatList,RefreshControl,StyleSheet,Text,View} from 'react-native';
import { Badge } from '@/components/Badge';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { listUsuarios } from '@/api/usuarios';
import { PERFIL_LABEL } from '@/lib/labels';
import { colors, radius, spacing, typography } from '@/theme';

export default function UsuariosScreen() {
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listUsuarios);

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
          icon="people-outline"
          title="Nenhum usuário"
          message="Ainda não há usuários cadastrados."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.badges}>
            <Badge label={PERFIL_LABEL[item.perfil]} color={colors.olive} />
            <Badge
              label={item.ativo ? 'Ativo' : 'Inativo'}
              color={item.ativo ? colors.success : colors.danger}
            />
          </View>
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
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLight,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nome: { ...typography.subtitle, color: colors.forest },
  email: { ...typography.caption, color: colors.olive },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
