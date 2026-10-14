import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '@/data/store';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="restaurant/[id]" options={{ title: 'Restaurant' }} />
          <Stack.Screen name="restaurant/new" options={{ title: 'New restaurant', presentation: 'modal' }} />
          <Stack.Screen name="settings/profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="settings/billing" options={{ title: 'Plans & billing' }} />
          <Stack.Screen name="settings/staff" options={{ title: 'Platform staff' }} />
          <Stack.Screen name="settings/notifications" options={{ title: 'Notifications' }} />
          <Stack.Screen name="settings/security" options={{ title: 'Security' }} />
          <Stack.Screen name="settings/help" options={{ title: 'Help & support' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
