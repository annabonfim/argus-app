import { useState } from 'react';
import {FlatList,Modal,Pressable,StyleSheet,Text,View} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/theme';

export interface SelectOption<T> {
  label: string;
  value: T;
}

interface SelectProps<T> {
  label: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Picker simples: campo que abre um modal com a lista de opções. Genérico
// (serve pra FK numérico e pra enums). Usado nos formulários de CRUD.
export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={selected ? styles.valueText : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.olive} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.fire} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>Nenhuma opção disponível.</Text>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  fieldDisabled: { opacity: 0.5 },
  label: {
    ...typography.caption,
    color: colors.forest,
    fontFamily: fonts.bodySemiBold,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderWidth: 1,
    borderColor: colors.fireWarm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.creamLight,
  },
  valueText: { ...typography.body, color: colors.forest },
  placeholder: { ...typography.body, color: colors.olive },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,13,9,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
    gap: spacing.sm,
  },
  sheetTitle: {
    ...typography.subtitle,
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLight,
  },
  optionText: { ...typography.body, color: colors.forest },
  empty: {
    ...typography.body,
    color: colors.olive,
    paddingVertical: spacing.md,
  },
});
