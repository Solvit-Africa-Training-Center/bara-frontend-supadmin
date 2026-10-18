import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Ubuntu_500Medium } from '@expo-google-fonts/ubuntu/500Medium';
import { Ubuntu_700Bold } from '@expo-google-fonts/ubuntu/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CustomAlertProvider } from '@/components/alert';
import { PaymentsProvider } from '@/api/payments';
import { SessionProvider, useSession } from '@/api/session';
import { StoreProvider } from '@/data/store';
import { colors } from '@/theme';

function Navigator() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Signed out, only the sign-in screens exist; signed in, only the app.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify-code" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Ubuntu_500Medium, Ubuntu_700Bold });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', colors.bg);
    }
  }, []);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <PaymentsProvider>
          <StoreProvider>
            <CustomAlertProvider>
              <StatusBar style="dark" />
              {Platform.OS === 'android' ? <RNStatusBar backgroundColor={colors.bg} translucent barStyle="dark-content" /> : null}
              <Navigator />
            </CustomAlertProvider>
          </StoreProvider>
        </PaymentsProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
