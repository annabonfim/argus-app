import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';

interface ScreenPlaceholderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

// Estado vazio consistente para as telas ainda não ligadas à API.
export function ScreenPlaceholder({
  icon,
  title,
  message,
}: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.olive} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.cream,
  },
  title: {
    ...typography.subtitle,
    color: colors.forest,
    marginTop: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.olive,
    textAlign: 'center',
  },
});
