import Feather from '@expo/vector-icons/Feather';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts } from '@/theme';
import { useSession } from '@/api/session';

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
  showEyebrow,
  refreshing,
  onRefresh,
  scroll = true,
  children,
}: {
  title: string;
  back?: string;
  showOwner?: boolean;
  showEyebrow?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
  children: ReactNode;
}) {
  const owner = useOwnerName();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const columnStyle = [s.column, isLandscape && { maxWidth: Math.min(width - 48, 720) }];

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={s.header}>
          <View style={columnStyle}>
            {showEyebrow ? <Text style={s.eyebrow}>BARA / PLATFORM ADMIN</Text> : null}
            {back ? (
              <View style={s.titleRow}>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={12}
                  style={s.backIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Back to ${back}`}
                >
                  <Feather name="arrow-left" size={20} color={colors.primary} />
                </Pressable>
                <Text style={[s.title, s.titleInRow]} numberOfLines={1}>
                  {title}
                </Text>
              </View>
            ) : (
              <Text style={s.title}>{title}</Text>
            )}
            {showOwner ? <Text style={s.owner}>{`${owner} · Platform owner · ${today()}`}</Text> : null}
          </View>
        </View>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[
              s.content,
              { flexGrow: 1, paddingBottom: isLandscape ? 32 : 120 },
              isLandscape && { paddingHorizontal: 20 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={!!refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                  progressBackgroundColor={colors.card}
                />
              ) : undefined
            }
          >
            <View style={columnStyle}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, isLandscape && { paddingHorizontal: 20 }]}>
            <View style={[columnStyle, { flex: 1 }]}>{children}</View>
          </View>
        )}
      </KeyboardAvoidingView>
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
export function T({
  children,
  style,
  muted,
  small,
  strong,
  numberOfLines,
  adjustsFontSizeToFit,
}: {
  children: ReactNode;
  style?: TextStyle;
  muted?: boolean;
  small?: boolean;
  strong?: boolean;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[
        s.body,
        muted && { color: colors.textMuted },
        small && s.small,
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
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[s.btnText, { color: primary ? '#fff' : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function LinkArrow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.primary }}>{label}</Text>
      <Feather name="arrow-right" size={14} color={colors.primary} />
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

export function PlanFeatures({ plan, features }: { plan: string; features: string[] }) {
  return (
    <View>
      <Text style={s.planName}>{plan.toUpperCase()}</Text>
      {features.map((feature) => (
        <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <Feather name="check" size={14} color={colors.text} />
          <Text style={s.body}>{feature}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- Dialogs ---------- */

export { customConfirm as confirm, customNotify as notify, CustomAlertProvider } from './alert';

/* ---------- Date Pickers ---------- */

export { DateRangePicker, type DateRangeValue, type PresetRange } from './date-range-picker';

/* ---------- Styles ---------- */

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: colors.bg },
  eyebrow: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.3, color: colors.primary, marginBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backIconBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  titleInRow: { marginTop: 0, flex: 1, fontSize: 21, lineHeight: 27 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.body, fontSize: 14, color: colors.primary },
  // Keeps content at phone width when the app is opened in a wide browser window.
  column: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, color: colors.text, marginTop: 4 },
  owner: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textMuted, marginTop: 4 },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 22, color: colors.text, marginBottom: 8 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.text },
  small: { fontSize: 12, lineHeight: 16.5 },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginBottom: 6 },
  info: { borderRadius: 10, padding: 12, marginBottom: 12 },
  infoTitle: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20, color: colors.text, marginBottom: 4 },
  infoBody: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: colors.text },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16 },
  btn: { minHeight: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  btnText: { fontFamily: fonts.bodySemi, fontSize: 14.5, lineHeight: 19 },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.border, borderRadius: 10, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.body, fontSize: 14.5, color: colors.text },
  inputText: { fontFamily: fonts.body, fontSize: 14.5, color: colors.text, flexShrink: 1 },
  menu: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginTop: 4, paddingVertical: 4 },
  planName: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textMuted, marginLeft: 10, marginBottom: 6 },
});
