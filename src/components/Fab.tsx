import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

interface FabProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string; // quando presente, vira um botão estendido (ícone + texto)
  onPress: () => void;
  accessibilityLabel: string;
}

// Botão de ação flutuante (canto inferior direito). Com label, fica explícito
// ("Nova ocorrência"); sem label, é só o círculo com o ícone.
export function Fab({ icon = 'add', label, onPress, accessibilityLabel }: FabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        label ? styles.extended : styles.circle,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={24} color={colors.cream} />
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fire,
    borderRadius: radius.pill,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  circle: { width: 56, height: 56 },
  extended: {
    height: 52,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  label: {
    ...typography.button,
    color: colors.cream,
  },
});
