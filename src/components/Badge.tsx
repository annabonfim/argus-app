import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';

interface BadgeProps {
  label: string;
  color: string;
}

export function Badge({ label, color }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    color: colors.cream,
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
  },
});
