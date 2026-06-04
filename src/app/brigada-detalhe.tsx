import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { getBrigada } from '@/api/brigadas';
import { listBrigadistas } from '@/api/brigadistas';
import { getErrorMessage } from '@/api/errors';
import { formatTelefone } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import {
  PerfilUsuario,
  type Brigada,
  type Brigadista,
} from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

export default function BrigadaDetalheScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const brigadaId = Number(id);

  const [brigada, setBrigada] = useState<Brigada | null>(null);
  const [equipe, setEquipe] = useState<Brigadista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const podeEditar =
    user?.perfil === PerfilUsuario.Admin ||
    user?.perfil === PerfilUsuario.Coordenador;

  const load = useCallback(async () => {
    setError(null);
    try {
      const b = await getBrigada(brigadaId);
      setBrigada(b);
      try {
        const todos = await listBrigadistas();
        setEquipe(todos.filter((x) => x.brigadaId === brigadaId));
      } catch {
        setEquipe([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [brigadaId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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
        <Text style={styles.headerTitle}>Brigada</Text>
        {podeEditar ? (
          <Pressable
            onPress={() => router.push(`/brigada-form?id=${brigadaId}`)}
            style={({ pressed }) => [styles.editButton, pressed && styles.editPressed]}
            accessibilityRole="button"
            accessibilityLabel="Editar brigada"
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
      ) : error || !brigada ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error ?? 'Brigada não encontrada.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Badge
            label={brigada.ativa ? 'Ativa' : 'Inativa'}
            color={brigada.ativa ? colors.success : colors.olive}
          />
          <Text style={styles.nome}>{brigada.nome}</Text>

          <View style={styles.card}>
            {!!brigada.baseOperacional && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Base operacional</Text>
                <Text style={styles.fieldValue}>{brigada.baseOperacional}</Text>
              </View>
            )}
            {!!brigada.telefone && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Telefone</Text>
                <Text style={styles.fieldValue}>
                  {formatTelefone(brigada.telefone)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brigadistas</Text>
            <Text style={styles.count}>{equipe.length}</Text>
          </View>

          {equipe.length === 0 ? (
            <Text style={styles.empty}>Nenhum brigadista nesta brigada.</Text>
          ) : (
            equipe.map((b) => (
              <Pressable
                key={b.id}
                style={({ pressed }) => [
                  styles.membro,
                  pressed && podeEditar && styles.membroPressed,
                ]}
                onPress={
                  podeEditar
                    ? () => router.push(`/brigadista-form?id=${b.id}`)
                    : undefined
                }
              >
                <View style={styles.membroBody}>
                  <Text style={styles.membroNome}>{b.nome}</Text>
                  {!!b.funcao && (
                    <Text style={styles.membroMeta}>{b.funcao}</Text>
                  )}
                  {!!b.telefone && (
                    <Text style={styles.membroMeta}>
                      {formatTelefone(b.telefone)}
                    </Text>
                  )}
                </View>
                {!b.ativo && <Badge label="Inativo" color={colors.olive} />}
                {podeEditar && (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.olive}
                  />
                )}
              </Pressable>
            ))
          )}

          {podeEditar && (
            <Button
              title="Adicionar brigadista"
              variant="outline"
              onPress={() =>
                router.push(`/brigadista-form?brigadaId=${brigadaId}`)
              }
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
  headerSpacer: { width: 78 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: { padding: spacing.xl, gap: spacing.lg },
  nome: { ...typography.title, color: colors.forest },
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
  sectionHeader: {
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
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
  membro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.creamLight,
  },
  membroPressed: { opacity: 0.7 },
  membroBody: { flex: 1, gap: 2 },
  membroNome: {
    ...typography.body,
    fontFamily: fonts.bodySemiBold,
    color: colors.forest,
  },
  membroMeta: { ...typography.caption, color: colors.olive },
});
