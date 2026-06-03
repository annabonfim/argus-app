import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Logo } from '@/components/Logo';
import { colors, fonts, spacing, typography } from '@/theme';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SobreScreen() {
  const router = useRouter();
  const version = Application.nativeApplicationVersion ?? '1.0.0';
  const build = Application.nativeBuildVersion ?? '—';
  // Injetado em build-time via app.json → extra.commitHash; 'dev' em desenvolvimento.
  const commit =
    (Constants.expoConfig?.extra?.commitHash as string | undefined) ?? 'dev';

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={styles.close}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      >
        <Ionicons name="close" size={28} color={colors.forest} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Logo variant="horizontal" width={240} />
        <Text style={styles.tagline}>
          Sistema operacional de combate a incêndios florestais
        </Text>

        <View style={styles.infoBlock}>
          <InfoRow label="Versão" value={version} />
          <InfoRow label="Build" value={build} />
          <InfoRow label="Commit" value={commit} />
        </View>

        <Text style={styles.credits}>FIAP · Global Solution 06/2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  close: {
    position: 'absolute',
    top: spacing.xxl + spacing.lg,
    right: spacing.lg,
    zIndex: 1,
    padding: spacing.xs,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  tagline: {
    ...typography.body,
    color: colors.olive,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  infoBlock: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.fireWarm,
    paddingBottom: spacing.sm,
  },
  rowLabel: {
    ...typography.body,
    color: colors.forest,
    fontFamily: fonts.bodySemiBold,
  },
  rowValue: {
    ...typography.body,
    color: colors.olive,
  },
  credits: {
    ...typography.caption,
    color: colors.olive,
    marginTop: spacing.xl,
  },
});
