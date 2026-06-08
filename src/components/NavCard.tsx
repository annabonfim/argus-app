import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { colors, radius, spacing, typography } from '@/theme';

interface NavCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  href: Href;
}

export function NavCard({ icon, title, subtitle, href }: NavCardProps) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.navigate(href)}
    >
      <Ionicons name={icon} size={28} color={colors.fire} />
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 150,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLight,
    // Lift sutil em vez de borda (evita moldura colorida em todo card).
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    ...typography.subtitle,
    color: colors.forest,
  },
  subtitle: {
    ...typography.caption,
    color: colors.olive,
    marginTop: 2,
  },
});
