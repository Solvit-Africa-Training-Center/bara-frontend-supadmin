import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError, errorMessage } from '@/api/client';
import { useSession } from '@/api/session';
import { AuthButton, AuthHeader, AuthLabel, authStyles, Checkbox, ErrorBox, IconInput, TextLink } from '@/components/auth';
import { InfoBox, T } from '@/components/ui';
import { colors } from '@/theme';

type Mode = 'code' | 'password' | 'reset';

const COPY: Record<Mode, { title: string; button: string; busy: string }> = {
  code: { title: 'Admin Sign In', button: 'Sign in to Admin Panel', busy: 'Sending your PIN…' },
  password: { title: 'Admin Sign In', button: 'Sign in to Admin Panel', busy: 'Signing in…' },
  reset: { title: 'Reset password', button: 'Send reset link', busy: 'Sending…' },
};

// "Admin Sign In" frame: step 1 of sign-in. A 6-digit PIN is emailed, then entered on /verify-code.
export default function SignIn() {
  const { remembered, signIn, requestLoginCode, requestPasswordReset } = useSession();
  const [mode, setMode] = useState<Mode>('code');
  const [email, setEmail] = useState(remembered?.email ?? '');
  const [remember, setRemember] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // The password route stays available only while the server can't email PINs yet.
  const [codesUnavailable, setCodesUnavailable] = useState(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = COPY[mode];

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
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) setCodesUnavailable(true);
      setError(errorMessage(e));
    } finally {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSlow(false);
      setBusy(false);
    }
  };

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  const submit = () => {
    if (busy) return;
    if (!validEmail) return setError('Enter a valid email address.');
    const address = email.trim().toLowerCase();
    if (mode === 'code') {
      run(async () => {
        await requestLoginCode(address);
        router.push({ pathname: '/verify-code', params: { email: address, remember: remember ? '1' : '0' } });
      });
    } else if (mode === 'password') {
      if (!password) return setError('Enter your password.');
      // On success the session switches to signed in and the app opens Home.
      run(() => signIn(address, password));
    } else {
      run(async () => setNotice(await requestPasswordReset(address)));
    }
  };

  const switchTo = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 520, alignSelf: 'center' }}>
            <AuthHeader />

            <Text style={[authStyles.eyebrow, { marginTop: 32 }]}>SECURE ACCESS</Text>
            <Text style={authStyles.title}>{copy.title}</Text>
            <T muted style={{ marginTop: 6, marginBottom: 28 }}>
              {mode === 'reset' ? 'We will email you a link to choose a new password.' : 'Restricted to authorized personnel only'}
            </T>

            <AuthLabel>EMAIL ADDRESS</AuthLabel>
            <IconInput
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="you@bara.rw"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!busy}
              onSubmitEditing={submit}
            />

            {mode === 'password' ? (
              <View style={{ marginTop: 18 }}>
                <AuthLabel>PASSWORD</AuthLabel>
                <IconInput
                  icon="lock"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!busy}
                  onSubmitEditing={submit}
                  right={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={10}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                    </Pressable>
                  }
                />
              </View>
            ) : null}

            {mode === 'code' ? <Checkbox checked={remember} label="Remember me" onChange={setRemember} /> : null}

            {error ? <ErrorBox>{error}</ErrorBox> : null}
            {notice ? (
              <View style={{ marginTop: 16 }}>
                <InfoBox title="Check your email">{notice}</InfoBox>
              </View>
            ) : null}

            <AuthButton label={copy.button} busyLabel={copy.busy} busy={busy} onPress={submit} />
            {slow ? (
              <T muted small style={{ marginTop: 12, textAlign: 'center' }}>
                Waking up the Bara server… this can take up to a minute.
              </T>
            ) : null}

            <View style={{ marginTop: 14 }}>
              {mode === 'code' && codesUnavailable ? (
                <TextLink label="Sign in with password instead" onPress={() => switchTo('password')} />
              ) : null}
              {mode === 'password' ? (
                <>
                  <TextLink label="Email me a PIN instead" onPress={() => switchTo('code')} />
                  <TextLink label="Forgot password?" onPress={() => switchTo('reset')} />
                </>
              ) : null}
              {mode === 'reset' ? <TextLink label="← Back to sign in" onPress={() => switchTo('password')} /> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
