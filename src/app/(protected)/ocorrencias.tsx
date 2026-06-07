import {ActivityIndicator,FlatList,Pressable,RefreshControl,StyleSheet,Text,View} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/Badge';
import { Fab } from '@/components/Fab';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { useAuth } from '@/context/AuthContext';
import { listOcorrencias } from '@/api/ocorrencias';
import { PerfilUsuario } from '@/types/domain';
import { statusOcorrenciaTheme } from '@/lib/labels';
import { formatCoords, formatDateTime } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/theme';

export default function OcorrenciasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listOcorrencias);

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
              icon="flame-outline"
              title="Nenhuma ocorrência"
              message="Ainda não há focos registrados."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => router.push(`/ocorrencia-detalhe?id=${item.id}`)}
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
      )}
      {podeCriar && (
        <Fab
          icon="add"
          label="Nova ocorrência"
          onPress={() => router.push('/ocorrencia-form')}
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
