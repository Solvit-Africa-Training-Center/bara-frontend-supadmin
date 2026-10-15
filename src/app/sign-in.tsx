import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorMessage } from '@/api/client';
import { useSession } from '@/api/session';
import { BaraLogo, Btn, Card, Gap, H, InfoBox, Input, Label, s, T } from '@/components/ui';
import { colors, fonts } from '@/theme';

// Not drawn in Figma: a sign-in screen in the same style as the Super Admin frames.
export default function SignIn() {
  const { signIn, requestPasswordReset } = useSession();
  const [mode, setMode] = useState<'signIn' | 'reset'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (slowTimer.current) clearTimeout(slowTimer.current);
  }, []);

  // The free Render server sleeps; tell the user why the first request is slow.
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    slowTimer.current = setTimeout(() => setSlow(true), 4000);
    try {
      await task();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSlow(false);
      setBusy(false);
    }
  };

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  const submit = () => {
    if (!validEmail) return setError('Enter a valid email address.');
    if (mode === 'signIn') {
      if (!password) return setError('Enter your password.');
      // On success the session switches to signed in and the app opens Home.
      run(() => signIn(email.trim().toLowerCase(), password));
    } else {
      run(async () => setNotice(await requestPasswordReset(email.trim().toLowerCase())));
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[s.content, { flexGrow: 1, justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
          <View style={s.column}>
            <BaraLogo />
            <Text style={[s.eyebrow, { marginTop: 28 }]}>BARA / PLATFORM ADMIN</Text>
            <Text style={s.title}>{mode === 'signIn' ? 'Sign in' : 'Reset password'}</Text>
            <T muted style={{ marginTop: 6, marginBottom: 20 }}>
              {mode === 'signIn' ? 'Super Admin access for the Bara platform owner.' : 'We will email you a link to choose a new password.'}
            </T>

            <Card>
              <H>{mode === 'signIn' ? 'Owner account' : 'Your account'}</H>
              <Label>Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@bara.rw"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!busy}
                onSubmitEditing={submit}
              />
              {mode === 'signIn' ? (
                <>
                  <Gap h={14} />
                  <Label>Password</Label>
                  <View style={{ justifyContent: 'center' }}>
                    <Input
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      editable={!busy}
                      onSubmitEditing={submit}
                      style={{ paddingRight: 48 }}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={10}
                      style={{ position: 'absolute', right: 14 }}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                    </Pressable>
                  </View>
                </>
              ) : null}
              <Gap h={18} />
              {error ? (
                <View style={{ backgroundColor: colors.redBg, borderRadius: 10, padding: 12, marginBottom: 14 }}>
                  <T style={{ color: colors.redText }}>{error}</T>
                </View>
              ) : null}
              {notice ? <InfoBox title="Check your email">{notice}</InfoBox> : null}
              {busy ? (
                <View style={[s.btn, { backgroundColor: colors.primary, borderColor: colors.primary, flexDirection: 'row', gap: 10 }]}>
                  <ActivityIndicator color="#fff" />
                  <Text style={[s.btnText, { color: '#fff' }]}>{mode === 'signIn' ? 'Signing in…' : 'Sending…'}</Text>
                </View>
              ) : (
                <Btn label={mode === 'signIn' ? 'Sign in' : 'Send reset link'} variant="primary" onPress={submit} />
              )}
              {slow ? (
                <T muted small style={{ marginTop: 12, textAlign: 'center' }}>
                  Waking up the Bara server… the first sign-in can take up to a minute.
                </T>
              ) : null}
            </Card>

            <Pressable
              onPress={() => {
                setMode(mode === 'signIn' ? 'reset' : 'signIn');
                setError(null);
                setNotice(null);
              }}
              hitSlop={8}
              style={{ alignSelf: 'center', paddingVertical: 8 }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.primary }}>
                {mode === 'signIn' ? 'Forgot password?' : '← Back to sign in'}
              </Text>
            </Pressable>
            <T muted small style={{ textAlign: 'center', marginTop: 16 }}>
              Only the Bara platform owner can use this app. Restaurant managers use the Bara restaurant app.
            </T>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
