import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavCard } from '@/components/NavCard';
import { useAuth } from '@/context/AuthContext';
import { PERFIL_LABEL } from '@/lib/labels';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Brigadista';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text style={styles.hello}>Olá,</Text>
        <Text style={styles.name}>{primeiroNome}</Text>
        {user && <Text style={styles.role}>{PERFIL_LABEL[user.perfil]}</Text>}
      </View>

      <View style={styles.cards}>
        <NavCard
          icon="flame-outline"
          title="Ocorrências"
          subtitle="Focos e atendimentos"
          href="/ocorrencias"
        />
        <NavCard
          icon="people-outline"
          title="Brigadas"
          subtitle="Equipes e brigadistas"
          href="/brigadas"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.xl, gap: spacing.xl },
  greeting: { marginTop: spacing.sm },
  hello: { ...typography.subtitle, color: colors.olive },
  name: { ...typography.title, color: colors.forest },
  role: { ...typography.body, color: colors.fire, marginTop: spacing.xs },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
