import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { NavCard } from '@/components/NavCard';
import { useAuth } from '@/context/AuthContext';
import { listAlertas } from '@/api/alertas';
import { listOcorrencias } from '@/api/ocorrencias';
import { listBrigadistas } from '@/api/brigadistas';
import { PERFIL_LABEL } from '@/lib/labels';
import { PerfilUsuario, StatusOcorrencia } from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

const POLL_INTERVAL_MS = 15_000;

// Card de indicador (número grande + rótulo). null vira "—" enquanto carrega
// ou se a chamada falhar.
function Kpi({
  value,
  label,
  color,
}: {
  value: number | null;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, { color }]}>{value ?? '—'}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Brigadista';

  const [alertasCriticos, setAlertasCriticos] = useState<number | null>(null);
  const [ocorrenciasAbertas, setOcorrenciasAbertas] = useState<number | null>(
    null,
  );
  const [brigadistasAtivos, setBrigadistasAtivos] = useState<number | null>(
    null,
  );

  // Cada KPI é best-effort: se uma chamada falhar, as outras seguem.
  const load = useCallback(async () => {
    try {
      const alertas = await listAlertas();
      setAlertasCriticos(
        alertas.filter((a) => a.nivel === 'CRITICO' || a.nivel === 'ALTO')
          .length,
      );
    } catch {
      setAlertasCriticos(null);
    }
    try {
      const ocorrencias = await listOcorrencias();
      setOcorrenciasAbertas(
        ocorrencias.filter((o) => o.status === StatusOcorrencia.Aberta).length,
      );
    } catch {
      setOcorrenciasAbertas(null);
    }
    try {
      const brigadistas = await listBrigadistas();
      setBrigadistasAtivos(brigadistas.filter((b) => b.ativo).length);
    } catch {
      setBrigadistasAtivos(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      // Mantém os KPIs atualizados em segundo plano enquanto a tela está aberta.
      const id = setInterval(load, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }, [load]),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text style={styles.hello}>Olá,</Text>
        <Text style={styles.name}>{primeiroNome}</Text>
        {user && <Text style={styles.role}>{PERFIL_LABEL[user.perfil]}</Text>}
      </View>

      <View style={styles.kpiRow}>
        <Kpi
          value={alertasCriticos}
          label="Alertas críticos"
          color={colors.danger}
        />
        <Kpi
          value={ocorrenciasAbertas}
          label="Ocorrências abertas"
          color={colors.fire}
        />
        <Kpi
          value={brigadistasAtivos}
          label="Brigadistas ativos"
          color={colors.success}
        />
      </View>

      <Text style={styles.sectionTitle}>Acesso rápido</Text>
      <View style={styles.cards}>
        {user?.brigadistaId != null && (
          <NavCard
            icon="shield-half-outline"
            title="Minha brigada"
            subtitle="Ocorrências da sua equipe"
            href="/minha-brigada"
          />
        )}
        <NavCard
          icon="people-outline"
          title="Brigadas"
          subtitle="Equipes e brigadistas"
          href="/brigadas"
        />
        <NavCard
          icon="cube-outline"
          title="Recursos"
          subtitle="Veículos e equipamentos"
          href="/recursos"
        />
        {user?.perfil === PerfilUsuario.Admin && (
          <NavCard
            icon="people-circle-outline"
            title="Usuários"
            subtitle="Gestão administrativa"
            href="/usuarios"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.xl, gap: spacing.lg },
  greeting: { marginTop: spacing.sm },
  hello: { ...typography.subtitle, color: colors.olive },
  name: { ...typography.title, color: colors.forest },
  role: { ...typography.body, color: colors.fire, marginTop: spacing.xs },
  kpiRow: { flexDirection: 'row', gap: spacing.sm },
  kpi: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLight,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kpiValue: { fontFamily: fonts.headingBold, fontSize: 28 },
  kpiLabel: {
    ...typography.caption,
    color: colors.olive,
    textAlign: 'center',
  },
  sectionTitle: { ...typography.subtitle, color: colors.forest },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
