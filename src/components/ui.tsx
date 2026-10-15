import Feather from '@expo/vector-icons/Feather';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts } from '@/theme';
import { useSession } from '@/api/session';
import { type Plan, planFeatures } from '@/data/store';

/* ---------- Screen frame: "BARA / PLATFORM ADMIN" header ---------- */

const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function useOwnerName() {
  const { user } = useSession();
  return user?.first_name || 'Owner';
}

export function AdminScreen({
  title,
  back,
  showOwner,
  demo,
  refreshing,
  onRefresh,
  children,
}: {
  title: string;
  back?: string;
  showOwner?: boolean;
  /** Marks screens that still show sample data because the API has no endpoint for them yet. */
  demo?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}) {
  const owner = useOwnerName();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View style={s.column}>
          <Text style={s.eyebrow}>BARA / PLATFORM ADMIN</Text>
          {back ? (
            <Pressable onPress={() => router.back()} hitSlop={8} style={s.back}>
              <Feather name="arrow-left" size={15} color={colors.primary} />
              <Text style={s.backText}>{back}</Text>
            </Pressable>
          ) : null}
          <Text style={s.title}>{title}</Text>
          {showOwner ? <Text style={s.owner}>{`${owner} · Platform owner · ${today()}`}</Text> : null}
          {demo ? (
            <View style={{ marginTop: 10 }}>
              <Pill label="Sample data · Not connected to the API yet" tone="yellow" />
            </View>
          ) : null}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        <View style={s.column}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Bara logo (same mark as the bara-mobile app) ---------- */

const BARS = [
  { height: 15, color: '#C1440E', width: 12 },
  { height: 26, color: '#E56A1C', width: 14 },
  { height: 34, color: '#EA982C', width: 14 },
  { height: 45, color: '#EBA529', width: 14 },
];

export function BaraLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 45 }}>
          {BARS.map((b) => (
            <View key={b.color} style={{ width: b.width, height: b.height, backgroundColor: b.color, borderRadius: 4 }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
          <View style={{ width: 51, height: 4, borderRadius: 12, backgroundColor: colors.text }} />
          <Feather name="check" size={14} color={colors.greenText} />
        </View>
      </View>
      <Text style={{ fontFamily: fonts.heading, fontSize: 34, lineHeight: 40, color: '#9A3412' }}>Bara</Text>
    </View>
  );
}

/* ---------- Loading / error states for API data ---------- */

export function LoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  if (error) {
    return (
      <View style={{ backgroundColor: colors.redBg, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <Text style={[s.infoTitle, { color: colors.redText }]}>Couldn’t load from the Bara server</Text>
        <Text style={[s.infoBody, { marginBottom: 12 }]}>{error}</Text>
        <Btn label="Try again" onPress={onRetry} />
      </View>
    );
  }
  if (loading) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 }}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[s.body, { color: colors.textMuted }]}>Loading from the Bara server…</Text>
      </View>
    );
  }
  return null;
}

/* ---------- Text ---------- */

export function H({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[s.cardTitle, style]}>{children}</Text>;
}
export function T({ children, style, muted, small, strong }: { children: ReactNode; style?: TextStyle; muted?: boolean; small?: boolean; strong?: boolean }) {
  return (
    <Text
      style={[
        s.body,
        muted && { color: colors.textMuted },
        small && { fontSize: 15.5, lineHeight: 21 },
        strong && { fontFamily: fonts.bodySemi },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Label({ children }: { children: ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
export function Gap({ h = 10 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

/* ---------- Containers ---------- */

export function Card({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: ViewStyle }) {
  return <View style={[s.card, muted && { backgroundColor: colors.cardMuted }, style]}>{children}</View>;
}

export function InfoBox({ title, children, tone = 'green' }: { title: string; children: ReactNode; tone?: 'green' | 'yellow' }) {
  return (
    <View style={[s.info, { backgroundColor: tone === 'green' ? colors.greenBg : colors.yellowBg }]}>
      <Text style={s.infoTitle}>{title}</Text>
      <Text style={s.infoBody}>{children}</Text>
    </View>
  );
}

/* ---------- Pills ---------- */

export type Tone = 'green' | 'yellow' | 'red' | 'neutral' | 'plain';
const tones: Record<Tone, [string, string]> = {
  green: [colors.greenBg, colors.greenText],
  yellow: [colors.yellowBg, colors.yellowText],
  red: [colors.redBg, colors.redText],
  neutral: [colors.neutralBg, colors.neutralText],
  plain: ['transparent', colors.neutralText],
};

export function Pill({ label, tone = 'neutral', onPress }: { label: string; tone?: Tone; onPress?: () => void }) {
  const [bg, fg] = tones[tone];
  const body = (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export function Row({ children, gap = 10, style }: { children: ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap }, style]}>{children}</View>;
}

/* ---------- Buttons ---------- */

export function Btn({ label, onPress, variant = 'outline', disabled, style }: { label: string; onPress?: () => void; variant?: 'primary' | 'outline'; disabled?: boolean; style?: ViewStyle }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        primary ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border },
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[s.btnText, { color: primary ? '#fff' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function LinkArrow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16.5, color: colors.primary }}>{label}</Text>
      <Feather name="arrow-right" size={15} color={colors.primary} />
    </Pressable>
  );
}

/* ---------- Form fields ---------- */

export function Input({ style, ...props }: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textMuted} style={[s.input, style]} {...props} />;
}

export function Select<V extends string>({ value, options, onChange }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View>
      <Pressable onPress={() => setOpen(!open)} style={[s.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={s.inputText} numberOfLines={1}>
          {current?.label}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
      </Pressable>
      {open ? (
        <View style={s.menu}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={{ paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Text style={[s.inputText, o.value === value && { color: colors.primary, fontFamily: fonts.bodySemi }]}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ---------- Plan feature list (PREMIUM / PRO / BASIC) ---------- */

export function PlanFeatures({ plan }: { plan: Plan }) {
  return (
    <View>
      <Text style={s.planName}>{plan}</Text>
      {planFeatures(plan).map((f) => (
        <View key={f.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          {f.included ? <Feather name="check" size={14} color={colors.text} /> : <Text style={s.body}>—</Text>}
          <Text style={s.body}>{f.included ? f.label : `No ${f.label}`}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- Dialogs ---------- */

export function confirm(title: string, message: string, onYes: () => void, yesLabel = 'Confirm') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: yesLabel, onPress: onYes },
  ]);
}

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

/* ---------- Styles ---------- */

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: colors.bg },
  eyebrow: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 0.2, color: colors.primary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.body, fontSize: 16, color: colors.primary },
  // Keeps content at phone width when the app is opened in a wide browser window.
  column: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 36, color: colors.text, marginTop: 8 },
  owner: { fontFamily: fonts.body, fontSize: 16.5, color: colors.textMuted, marginTop: 6 },
  content: { padding: 20, paddingBottom: 28 },
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 14 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 18.5, color: colors.text, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 16.5, lineHeight: 23.5, color: colors.text },
  label: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text, marginBottom: 7 },
  info: { borderRadius: 12, padding: 14, marginBottom: 14 },
  infoTitle: { fontFamily: fonts.bodySemi, fontSize: 18.5, color: colors.text, marginBottom: 6 },
  infoBody: { fontFamily: fonts.body, fontSize: 16.5, lineHeight: 23.5, color: colors.text },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 15.5 },
  btn: { minHeight: 50, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnText: { fontFamily: fonts.bodySemi, fontSize: 17.5 },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.border, borderRadius: 10, minHeight: 48, paddingHorizontal: 14, paddingVertical: 11, fontFamily: fonts.body, fontSize: 18.5, color: colors.text },
  inputText: { fontFamily: fonts.body, fontSize: 18.5, color: colors.text, flexShrink: 1 },
  menu: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginTop: 4, paddingVertical: 4 },
  planName: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.textMuted, marginLeft: 10, marginBottom: 8 },
});
