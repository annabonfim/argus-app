import {ActivityIndicator,Pressable,StyleSheet,Text,View} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'fire' | 'outline' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.forest : colors.cream} />
      ) : (
        <View style={styles.row}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isOutline ? colors.forest : colors.cream}
            />
          )}
          <Text style={[styles.label, isOutline && styles.labelOutline]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.forest },
  fire: { backgroundColor: colors.fire },
  danger: { backgroundColor: colors.danger },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.forest,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: {
    ...typography.button,
    color: colors.cream,
  },
  labelOutline: {
    color: colors.forest,
  },
});
