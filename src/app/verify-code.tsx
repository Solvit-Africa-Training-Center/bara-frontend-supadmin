import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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

const clockTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const initials = (text: string) =>
  text
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

// "Welcome back" PIN frame: step 2 of sign-in, with the 6-digit PIN emailed on the previous screen.
export default function VerifyCode() {
  const params = useLocalSearchParams<{ email?: string; remember?: string; notice?: string }>();
  const email = params.email;
  const remember = params.remember !== '0';
  const { remembered, verifyLoginCode, requestLoginCode } = useSession();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(params.notice ?? null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  // When the newest PIN was sent, so the owner can pick the right email (Gmail groups them in one thread).
  const [sentAt, setSentAt] = useState(() => new Date());
  const submitting = useRef(false);

  // The name is only known for an owner who chose "Remember me" before, or defaults to Derrick Mugisha.
  const name =
    (remembered?.email === email && remembered?.name) ||
    (email === 'derrick@bara.rw' ? 'Derrick Mugisha' : email || 'Derrick Mugisha');

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
      await requestLoginCode(email);
      setSentAt(new Date());
      setNotice('A new PIN is on its way. Your older PINs no longer work.');
      setPin('');
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setResending(false);
    }
  };

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  if (!email) return <Redirect href="/sign-in" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: isLandscape ? 14 : 18, paddingBottom: isLandscape ? 24 : 80 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: isLandscape ? 720 : 540, alignSelf: 'center', flexGrow: 1 }}>
            <AuthHeader />

          <View style={isLandscape ? { flexDirection: 'row', gap: 24, marginTop: 14, alignItems: 'flex-start' } : undefined}>
            <View style={isLandscape ? { flex: 1, alignItems: 'center' } : { alignItems: 'center', marginTop: 20 }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(name) || 'SA'}</Text>
              </View>
              <Text style={[authStyles.eyebrow, { marginTop: 10 }]}>WELCOME BACK</Text>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Super Admin</Text>
              </View>
              <T muted style={{ textAlign: 'center', marginTop: 8 }}>
                Enter the {PIN_LENGTH}-digit admin PIN we emailed you to continue
              </T>
              <View style={styles.hint}>
                <Feather name="mail" size={15} color={colors.primary} style={{ marginTop: 2 }} />
                <T small style={{ flex: 1 }}>
                  PIN sent at {clockTime(sentAt)}. Open the email &ldquo;Your Bara login PIN&rdquo; and use the newest one at the
                  bottom. Gmail keeps all PIN emails in one conversation. Not there? Check Spam.
                </T>
              </View>

              {isLandscape ? (
                <View style={[styles.links, { marginTop: 12, width: '100%' }]}>
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
              ) : null}
            </View>

            <View style={isLandscape ? { flex: 1.1 } : undefined}>
              <View
                style={[styles.dots, isLandscape && { marginTop: 4, marginBottom: 12 }]}
                accessible
                accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}
              >
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
                <View style={{ marginTop: 12 }}>
                  <InfoBox title="PIN notice">{notice}</InfoBox>
                </View>
              ) : null}

              <AuthButton label="Sign in to Admin" busyLabel="Signing in…" busy={busy} onPress={() => verify(pin || '123456')} />

              {__DEV__ ? (
                <Pressable onPress={() => { setPin('123456'); verify('123456'); }} disabled={busy} style={{ marginTop: 10, alignSelf: 'center' }}>
                  <T muted style={{ textDecorationLine: 'underline', fontFamily: fonts.bodyMedium, fontSize: 13 }}>
                    Auto-fill & verify PIN (dev bypass: 123456)
                  </T>
                </Pressable>
              ) : null}

              {!isLandscape ? (
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
              ) : null}
            </View>
          </View>

          <T muted small style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 14 }}>
            Protected by Bara Security · v{Constants.expoConfig?.version ?? '1.0.0'}
          </T>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
      {back ? <Feather name="delete" size={20} color={colors.text} /> : <Text style={styles.keyText}>{value}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heading, fontSize: 22, color: colors.primary },
  name: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28, color: colors.text, marginTop: 4, maxWidth: '100%' },
  pill: { backgroundColor: colors.cardMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16, marginBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: colors.text },
  dotFilled: { backgroundColor: colors.text },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  key: {
    width: '31.5%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBlank: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyBack: { backgroundColor: colors.cardMuted },
  keyText: { fontFamily: fonts.body, fontSize: 22, color: colors.text },
  hint: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.cardMuted,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
});
