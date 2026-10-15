import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { T } from '@/components/ui';
import { colors, fonts } from '@/theme';

/* Pieces shared by the sign-in and PIN screens (the "BARA SUPER ADMIN" Figma frames). */

export function AuthHeader() {
  return (
    <View style={styles.header}>
      <Feather name="shield" size={18} color="#fff" />
      <Text style={styles.headerText}>BARA SUPER ADMIN</Text>
    </View>
  );
}

export function AuthLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function IconInput({ icon, right, ...props }: TextInputProps & { icon: ComponentProps<typeof Feather>['name']; right?: ReactNode }) {
  return (
    <View style={styles.field}>
      <Feather name={icon} size={20} color={colors.textMuted} />
      <TextInput placeholderTextColor={colors.textMuted} style={styles.fieldInput} {...props} />
      {right}
    </View>
  );
}

export function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (next: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      hitSlop={8}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>{checked ? <Feather name="check" size={15} color="#fff" /> : null}</View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

export function AuthButton({ label, busyLabel, busy, onPress }: { label: string; busyLabel: string; busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.85 }]}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <Feather name="log-in" size={20} color="#fff" />}
      <Text style={styles.buttonText}>{busy ? busyLabel : label}</Text>
    </Pressable>
  );
}

export function TextLink({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 8 }}>
      <Text style={[styles.link, disabled && { color: colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.redBg, borderRadius: 10, padding: 12, marginTop: 16 }}>
      <T style={{ color: colors.redText }}>{children}</T>
    </View>
  );
}

export const authStyles = StyleSheet.create({
  eyebrow: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 1.6, color: colors.textMuted },
  title: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 40, color: colors.text, marginTop: 6 },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  headerText: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 2, color: '#fff' },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 1.6, color: colors.textMuted, marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 58,
    paddingHorizontal: 16,
  },
  fieldInput: { flex: 1, fontFamily: fonts.body, fontSize: 18, color: colors.text, paddingVertical: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginTop: 18 },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontFamily: fonts.body, fontSize: 17, color: colors.text },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginTop: 24,
  },
  buttonText: { fontFamily: fonts.bodySemi, fontSize: 18, color: '#fff' },
  link: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.primary },
});
