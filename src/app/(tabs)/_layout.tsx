import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RestaurantsProvider } from '@/api/restaurants';
import { colors, fonts } from '@/theme';

type IconProps = { color: ColorValue };

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isPhoneLandscape = isLandscape && height < 500;
  const bottomInset = insets.bottom;

  return (
    <RestaurantsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.tabBg,
            borderTopColor: colors.divider,
            height: isPhoneLandscape ? 44 + bottomInset : (Platform.OS === 'ios' ? 56 : 62) + bottomInset,
            paddingTop: isPhoneLandscape ? 4 : 8,
            paddingBottom: bottomInset > 0 ? bottomInset : isPhoneLandscape ? 4 : 8,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          tabBarLabelStyle: {
            fontFamily: fonts.bodyMedium,
            fontSize: isPhoneLandscape ? 10.5 : 11.5,
            paddingBottom: bottomInset > 0 ? 0 : isPhoneLandscape ? 2 : 4,
          },
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }: IconProps) => <Feather name="home" size={isPhoneLandscape ? 18 : 21} color={color} /> }} />
        <Tabs.Screen
          name="restaurants"
          options={{
            title: 'Restaurants',
            tabBarIcon: ({ color }: IconProps) => <MaterialCommunityIcons name="storefront-outline" size={isPhoneLandscape ? 19 : 22} color={color} />,
          }}
        />
        <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarIcon: ({ color }: IconProps) => <Feather name="inbox" size={isPhoneLandscape ? 18 : 21} color={color} /> }} />
        <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }: IconProps) => <Feather name="more-horizontal" size={isPhoneLandscape ? 19 : 22} color={color} /> }} />
      </Tabs>
    </RestaurantsProvider>
  );
}
