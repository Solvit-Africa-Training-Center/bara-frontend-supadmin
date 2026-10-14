import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors, fonts } from '@/theme';

type IconProps = { color: ColorValue };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.tabBg, borderTopColor: colors.divider, height: 74, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 13, paddingBottom: 8 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }: IconProps) => <Feather name="home" size={23} color={color} /> }} />
      <Tabs.Screen
        name="restaurants"
        options={{ title: 'Restaurants', tabBarIcon: ({ color }: IconProps) => <MaterialCommunityIcons name="storefront-outline" size={25} color={color} /> }}
      />
      <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarIcon: ({ color }: IconProps) => <Feather name="inbox" size={23} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }: IconProps) => <Feather name="more-horizontal" size={25} color={color} /> }} />
    </Tabs>
  );
}
