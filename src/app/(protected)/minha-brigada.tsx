import { useEffect, useState } from 'react';
import {ActivityIndicator,FlatList,Pressable,RefreshControl,StyleSheet,Text,View} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/Badge';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useResourceList } from '@/hooks/useResourceList';
import { useAuth } from '@/context/AuthContext';
import { listOcorrencias } from '@/api/ocorrencias';
import { getBrigadista } from '@/api/brigadistas';
import { getBrigada } from '@/api/brigadas';
import { statusOcorrenciaTheme } from '@/lib/labels';
import { formatCoords, formatDateTime } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/theme';

// "Minha brigada": as ocorrências da brigada do brigadista logado. A brigada sai
// do vínculo brigadistaId → Brigadista.brigadaId (resolvido uma vez no mount).
export default function MinhaBrigadaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, refreshing, error, refresh } =
    useResourceList(listOcorrencias);

  const [brigadaId, setBrigadaId] = useState<number | null>(null);
  const [brigadaNome, setBrigadaNome] = useState<string | null>(null);

  useEffect(() => {
    const bid = user?.brigadistaId;
    if (bid == null) return;
    (async () => {
      try {
        const brigadista = await getBrigadista(bid);
        setBrigadaId(brigadista.brigadaId);
        const brigada = await getBrigada(brigadista.brigadaId);
        setBrigadaNome(brigada.nome);
      } catch {
        // best-effort: se falhar, a tela só não mostra o nome/ocorrências.
      }
    })();
  }, [user?.brigadistaId]);

  // Ainda resolvendo a brigada ou carregando a lista.
  if (loading || (user?.brigadistaId != null && brigadaId == null)) {
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

  // Mais recentes primeiro (por data de abertura).
  const visiveis = data
    .filter((o) => o.brigadaId === brigadaId)
    .slice()
    .sort((a, b) => +new Date(b.dataAbertura) - +new Date(a.dataAbertura));

  return (
    <View style={styles.screen}>
      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-half" size={22} color={colors.fire} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerLabel}>Sua brigada</Text>
              <Text style={styles.headerNome}>{brigadaNome ?? 'Brigada'}</Text>
            </View>
            <Text style={styles.headerCount}>{visiveis.length}</Text>
          </View>
        }
        ListEmptyComponent={
          <ScreenPlaceholder
            icon="flame-outline"
            title="Nenhuma ocorrência"
            message="A sua brigada ainda não tem ocorrências atribuídas."
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.fireWarm,
    marginBottom: spacing.xs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.fireWarm,
  },
  headerText: { flex: 1, gap: 2 },
  headerLabel: {
    ...typography.caption,
    color: colors.olive,
    fontFamily: fonts.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerNome: {
    ...typography.subtitle,
    fontFamily: fonts.headingBold,
    color: colors.forest,
  },
  headerCount: {
    ...typography.title,
    fontFamily: fonts.headingBold,
    color: colors.fire,
  },
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
