import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Card, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

// The More menu is not drawn in Figma; Home says Subscriptions, Support and Reports are "Available from More".
export default function More() {
  const { payments, session, lastActivity } = useStore();
  const items = [
    { label: 'Subscriptions', hint: `${payments.filter((p) => !p.applied).length} verified payment waiting`, href: '/more/subscriptions' },
    { label: 'Support', hint: session.resolved ? 'No open sessions' : `${session.ticket} · Read-only session open`, href: '/more/support' },
    { label: 'Reports', hint: 'Billing, renewals and flagged operations', href: '/more/reports' },
  ] as const;

  return (
    <AdminScreen title="More" showOwner>
      {items.map((it) => (
        <Pressable key={it.label} onPress={() => router.push(it.href)}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: fonts.heading, fontSize: 17, marginBottom: 4 }}>{it.label}</T>
              <T muted small>
                {it.hint}
              </T>
            </View>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </Card>
        </Pressable>
      ))}
      <T muted small>
        Owner session authenticated · Last activity: {lastActivity}
      </T>
    </AdminScreen>
  );
}
