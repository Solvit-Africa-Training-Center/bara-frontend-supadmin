import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorMessage } from '@/api/client';
import { useSession } from '@/api/session';
import { AuthButton, AuthHeader, authStyles, ErrorBox, TextLink } from '@/components/auth';
import { InfoBox, T } from '@/components/ui';
import { colors, fonts } from '@/theme';

const PIN_LENGTH = 6;
const RESEND_SECONDS = 30;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;
type Key = (typeof KEYS)[number];

const initials = (text: string) =>
  text
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

// "Welcome back" PIN frame: step 2 of sign-in, with the 6-digit PIN emailed on the previous screen.
export default function VerifyCode() {
  const params = useLocalSearchParams<{ email?: string; remember?: string }>();
  const email = params.email;
  const remember = params.remember !== '0';
  const { remembered, verifyLoginCode, requestLoginCode } = useSession();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const submitting = useRef(false);

  // The name is only known for an owner who chose "Remember me" before.
  const name = (remembered?.email === email && remembered?.name) || email || '';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = useCallback(
    async (value: string) => {
      if (!email || submitting.current) return;
      if (value.length < PIN_LENGTH) return setError(`Enter all ${PIN_LENGTH} digits from the email.`);
      submitting.current = true;
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        // On success the session switches to signed in and the app opens Home.
        await verifyLoginCode(email, value, remember);
      } catch (e) {
        setError(errorMessage(e));
        setPin('');
        setBusy(false);
      } finally {
        submitting.current = false;
      }
    },
    [email, remember, verifyLoginCode],
  );

  const press = useCallback(
    (key: Key) => {
      if (busy || key === '') return;
      setError(null);
      if (key === 'back') return setPin(pin.slice(0, -1));
      if (pin.length >= PIN_LENGTH) return;
      const next = pin + key;
      setPin(next);
      if (next.length === PIN_LENGTH) verify(next);
    },
    [busy, pin, verify],
  );

  // On the web, let the owner type or paste the PIN with the keyboard too.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) press(event.key as Key);
      else if (event.key === 'Backspace') press('back');
      else if (event.key === 'Enter') verify(pin);
    };
    const onPaste = (event: ClipboardEvent) => {
      const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, PIN_LENGTH);
      if (!digits || busy) return;
      setPin(digits);
      if (digits.length === PIN_LENGTH) verify(digits);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('paste', onPaste);
    };
  }, [press, busy, pin, verify]);

  const resend = async () => {
    if (!email || cooldown > 0 || resending || busy) return;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      setNotice(await requestLoginCode(email));
      setPin('');
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setResending(false);
    }
  };

  if (!email) return <Redirect href="/sign-in" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 24 }}>
        <View style={{ width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1 }}>
          <AuthHeader />

          <View style={{ alignItems: 'center', marginTop: 28 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name) || 'SA'}</Text>
            </View>
            <Text style={[authStyles.eyebrow, { marginTop: 14 }]}>WELCOME BACK</Text>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Super Admin</Text>
            </View>
            <T muted style={{ textAlign: 'center', marginTop: 14 }}>
              Enter the {PIN_LENGTH}-digit admin PIN we emailed you to continue
            </T>
          </View>

          <View style={styles.dots} accessible accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}>
            {Array.from({ length: PIN_LENGTH }, (_, i) => (
              <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
            ))}
          </View>

          <View style={styles.pad}>
            {KEYS.map((key, i) => (
              <PadKey key={`${key}-${i}`} value={key} disabled={busy} onPress={() => press(key)} />
            ))}
          </View>

          {error ? <ErrorBox>{error}</ErrorBox> : null}
          {notice ? (
            <View style={{ marginTop: 16 }}>
              <InfoBox title="Check your email">{notice}</InfoBox>
            </View>
          ) : null}

          <AuthButton label="Sign in to Admin" busyLabel="Signing in…" busy={busy} onPress={() => verify(pin)} />

          <View style={styles.links}>
            <TextLink
              label={resending ? 'Sending…' : cooldown > 0 ? `Resend PIN (${cooldown}s)` : 'Resend PIN'}
              onPress={resend}
              disabled={cooldown > 0 || resending || busy}
            />
            <TextLink
              label="Change email"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/sign-in'))}
              disabled={busy}
            />
          </View>

          <T muted small style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 16 }}>
            Protected by Bara Security · v{Constants.expoConfig?.version ?? '1.0.0'}
          </T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PadKey({ value, disabled, onPress }: { value: Key; disabled: boolean; onPress: () => void }) {
  if (value === '') return <View style={[styles.key, styles.keyBlank]} />;
  const back = value === 'back';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={back ? 'Delete last digit' : value}
      style={({ pressed }) => [styles.key, back && styles.keyBack, pressed && { opacity: 0.6 }]}
    >
      {back ? <Feather name="delete" size={22} color={colors.text} /> : <Text style={styles.keyText}>{value}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heading, fontSize: 28, color: colors.primary },
  name: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, color: colors.text, marginTop: 4, maxWidth: '100%' },
  pill: { backgroundColor: colors.cardMuted, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 22, marginBottom: 22 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.text },
  dotFilled: { backgroundColor: colors.text },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  key: {
    width: '31.5%',
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBlank: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyBack: { backgroundColor: colors.cardMuted },
  keyText: { fontFamily: fonts.body, fontSize: 26, color: colors.text },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
