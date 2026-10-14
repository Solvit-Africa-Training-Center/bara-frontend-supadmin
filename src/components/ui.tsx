import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, radius, space } from '@/theme';
import type { RestaurantStatus } from '@/data/store';

export function BaraLogo({ size = 28 }: { size?: number }) {
  const s = size / 28;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Svg width={30 * s} height={28 * s} viewBox="0 0 30 28">
        <Rect x="0" y="16" width="6" height="8" rx="2" fill={colors.primary} />
        <Rect x="8" y="10" width="6" height="14" rx="2" fill="#E8590C" />
        <Rect x="16" y="4" width="6" height="20" rx="2" fill={colors.brandGold} />
        <Rect x="24" y="0" width="6" height="24" rx="2" fill={colors.brandGold} />
        <Path d="M0 26.5h20" stroke={colors.text} strokeWidth="2" />
        <Path d="M21 25l2 2 4-5" stroke={colors.success} strokeWidth="1.6" fill="none" />
      </Svg>
      <Text style={{ fontSize: 22 * s, fontWeight: '800', color: colors.brand }}>Bara</Text>
    </View>
  );
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function PageHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style, muted }: { children: ReactNode; style?: ViewStyle; muted?: boolean }) {
  return <View style={[styles.card, muted && { backgroundColor: colors.surfaceMuted }, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
const toneColors: Record<Tone, [string, string]> = {
  success: [colors.successSoft, colors.success],
  warning: [colors.warningSoft, colors.warning],
  danger: [colors.dangerSoft, colors.danger],
  neutral: [colors.surfaceMuted, colors.textMuted],
  primary: [colors.primarySoft, colors.primary],
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const [bg, fg] = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export const statusTone: Record<RestaurantStatus, Tone> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
};

export function StatusBadge({ status }: { status: RestaurantStatus }) {
  return <Badge label={status[0].toUpperCase() + status.slice(1)} tone={statusTone[status]} />;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  small,
  icon,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  small?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const v = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    outline: { bg: colors.surface, fg: colors.text, border: colors.border },
    danger: { bg: colors.surface, fg: colors.danger, border: '#F1B5B5' },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, small && { fontSize: 13 }, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#B09A88" style={styles.input} {...props} />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      {typeof value === 'string' ? <Text style={styles.kvValue}>{value}</Text> : value}
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 32 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, flexShrink: 1 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    marginBottom: space.md,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm, marginTop: space.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  button: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.sm },
  buttonText: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, gap: 12 },
  kvLabel: { fontSize: 14, color: colors.textMuted },
  kvValue: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
  muted: { fontSize: 13, color: colors.textMuted },
  strong: { fontSize: 15, fontWeight: '700', color: colors.text },
});
