import Feather from '@expo/vector-icons/Feather';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, confirm, PageHeader, Screen, styles } from '@/components/ui';
import { colors } from '@/theme';

const items = [
  { icon: 'credit-card', label: 'Plans & billing', hint: 'Starter, Standard, Premium pricing', href: '/settings/billing' },
  { icon: 'users', label: 'Platform staff', hint: 'Who can use this Super Admin app', href: '/settings/staff' },
  { icon: 'bell', label: 'Notifications', hint: 'Alerts for approvals and outages', href: '/settings/notifications' },
  { icon: 'shield', label: 'Security', hint: 'Password, two-step sign-in', href: '/settings/security' },
  { icon: 'help-circle', label: 'Help & support', hint: 'Questions and contact', href: '/settings/help' },
] as const satisfies readonly { icon: keyof typeof Feather.glyphMap; label: string; hint: string; href: string }[];

export default function More() {
  return (
    <Screen>
      <PageHeader eyebrow="Super Admin" title="More" />
      <Pressable onPress={() => router.push('/settings/profile')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 18 }}>P</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.strong}>Patrick N.</Text>
            <Text style={styles.muted}>admin@bara.rw · Owner</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Card>
      </Pressable>

      <Card style={{ paddingVertical: 4 }}>
        {items.map((it, i) => (
          <Pressable
            key={it.label}
            onPress={() => router.push(it.href)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <Feather name={it.icon} size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{it.label}</Text>
              <Text style={styles.muted}>{it.hint}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <Button label="Sign out" variant="danger" icon={<Feather name="log-out" size={18} color={colors.danger} />} onPress={() => confirm('Sign out?', 'You will need to sign in again to manage restaurants.', () => router.replace('/'), 'Sign out')} />
      <Text style={[styles.muted, { textAlign: 'center', marginTop: 16 }]}>Bara Super Admin · v1.0.0</Text>
    </Screen>
  );
}
