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
import { Fab } from '@/components/Fab';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { useAuth } from '@/context/AuthContext';
import { listBrigadas } from '@/api/brigadas';
import { formatTelefone } from '@/lib/format';
import { PerfilUsuario } from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

export default function BrigadasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listBrigadas);

  // Brigadista só lê; Admin/Coordenador criam e editam (POST/PUT gated no backend).
  const podeEditar =
    user?.perfil === PerfilUsuario.Admin ||
    user?.perfil === PerfilUsuario.Coordenador;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.fire} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {error ? (
        <ScreenPlaceholder
          icon="cloud-offline-outline"
          title="Não foi possível carregar"
          message={error}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <ScreenPlaceholder
              icon="people-outline"
              title="Nenhuma brigada"
              message="Ainda não há brigadas cadastradas."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => router.push(`/brigada-detalhe?id=${item.id}`)}
            >
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.nome}</Text>
                  <Badge
                    label={item.ativa ? 'Ativa' : 'Inativa'}
                    color={item.ativa ? colors.success : colors.olive}
                  />
                </View>
                {!!item.baseOperacional && (
                  <Text style={styles.meta}>📍 {item.baseOperacional}</Text>
                )}
                {!!item.telefone && (
                  <Text style={styles.meta}>
                    📞 {formatTelefone(item.telefone)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.olive} />
            </Pressable>
          )}
        />
      )}
      {podeEditar && (
        <Fab
          icon="add"
          label="Nova brigada"
          onPress={() => router.push('/brigada-form')}
          accessibilityLabel="Nova brigada"
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.subtitle,
    color: colors.forest,
    flex: 1,
  },
  meta: { ...typography.caption, color: colors.olive },
});
