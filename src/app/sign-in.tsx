import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorMessage } from '@/api/client';
import { devSignInAvailable, useSession } from '@/api/session';
import { AuthButton, AuthHeader, AuthLabel, authStyles, Checkbox, ErrorBox, IconInput } from '@/components/auth';
import { T } from '@/components/ui';
import { colors, fonts } from '@/theme';

// "Admin Sign In" frame: step 1 of sign-in. A 6-digit PIN is emailed, then entered on /verify-code.
export default function SignIn() {
  const { remembered, requestLoginCode, devSignIn } = useSession();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [email, setEmail] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (slowTimer.current) clearTimeout(slowTimer.current);
  }, []);

  const submit = async () => {
    if (busy) return;
    const address = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(address)) return setError('Enter a valid email address.');
    setBusy(true);
    setError(null);
    // The server can be slow to answer; tell the user why they are waiting.
    slowTimer.current = setTimeout(() => setSlow(true), 4000);
    try {
      const notice = await requestLoginCode(address);
      router.push({ pathname: '/verify-code', params: { email: address, remember: remember ? '1' : '0', notice } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSlow(false);
      setBusy(false);
    }
  };

  // DEV ONLY: sign in with the refresh token from .env, without an emailed PIN.
  const skip = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await devSignIn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: isLandscape ? 32 : 18,
            paddingVertical: isLandscape ? 14 : 20,
            paddingBottom: isLandscape ? 32 : 100,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: isLandscape ? 580 : 540, alignSelf: 'center' }}>
            <AuthHeader />

            <Text style={[authStyles.eyebrow, { marginTop: isLandscape ? 14 : 24 }]}>SECURE ACCESS</Text>
            <Text style={authStyles.title}>Admin Sign In</Text>
            <T muted style={{ marginTop: 4, marginBottom: isLandscape ? 12 : 20 }}>
              Restricted to authorized personnel only
            </T>

            <AuthLabel>EMAIL ADDRESS</AuthLabel>
            <IconInput
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder={remembered?.email || 'you@bara.rw'}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!busy}
              onSubmitEditing={submit}
            />

            <Checkbox checked={remember} label="Remember me" onChange={setRemember} />

            {error ? <ErrorBox>{error}</ErrorBox> : null}

            <AuthButton label="Sign in to Admin Panel" busyLabel="Sending your PIN…" busy={busy} onPress={submit} />
            {devSignInAvailable ? (
              <Pressable onPress={skip} disabled={busy} hitSlop={8} style={{ marginTop: 16, alignSelf: 'center', paddingVertical: 6 }}>
                <T muted style={{ textDecorationLine: 'underline', fontFamily: fonts.bodyMedium, fontSize: 14.5 }}>
                  Skip sign-in (dev bypass)
                </T>
              </Pressable>
            ) : null}
            {slow ? (
              <T muted small style={{ marginTop: 10, textAlign: 'center' }}>
                The Bara server is slow to answer… this can take up to a minute.
              </T>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
