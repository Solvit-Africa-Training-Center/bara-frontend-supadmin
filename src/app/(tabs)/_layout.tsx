import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useStore } from '@/data/store';
import { colors } from '@/theme';

type IconName = keyof typeof Feather.glyphMap;
const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => (
  <Feather name={name} color={color} size={size} />
);

export default function TabLayout() {
  const { requests } = useStore();
  const open = requests.filter((r) => !r.resolved).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.navBg, borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', paddingBottom: 6 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="restaurants" options={{ title: 'Restaurants', tabBarIcon: icon('grid') }} />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: icon('inbox'),
          tabBarBadge: open || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: icon('menu') }} />
    </Tabs>
  );
}
