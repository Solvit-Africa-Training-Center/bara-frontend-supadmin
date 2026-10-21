import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { usePayments } from '@/api/payments';
import { useSession } from '@/api/session';
import { AdminScreen, Btn, Card, confirm, H, T } from '@/components/ui';
import { colors, fonts } from '@/theme';

export default function More() {
  const { user, signOut } = useSession();
  const { payments } = usePayments();
  const [signingOut, setSigningOut] = useState(false);

  const items = [
    { label: 'Subscriptions', hint: `${payments.filter((p) => p.status === 'pending').length} payment confirmations pending · Live`, href: '/more/subscriptions' },
    { label: 'Managers', hint: 'Browse manager accounts and restaurant assignments', href: '/more/managers/index' },
    { label: 'Support', hint: 'Support tickets are not available in the current API', href: '/more/support' },
    { label: 'Reports', hint: 'Live restaurant and payment overview · No billing totals', href: '/more/reports' },
  ] as const;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Platform owner';

  return (
    <AdminScreen title="More" showOwner>
      {items.map((it) => (
        <Pressable key={it.label} onPress={() => router.push(it.href)}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: fonts.heading, fontSize: 16, marginBottom: 4 }}>{it.label}</T>
              <T muted small>{it.hint}</T>
            </View>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </Card>
        </Pressable>
      ))}

      <Card muted>
        <H>Signed in</H>
        <T style={{ fontFamily: fonts.bodySemi, marginBottom: 4 }}>{fullName}</T>
        {user?.email ? <T muted style={{ marginBottom: 14 }}>{user.email}</T> : null}
        <Btn
          label={signingOut ? 'Signing out…' : 'Sign out'}
          disabled={signingOut}
          onPress={() =>
            confirm('Sign out?', 'You will need your email and password to sign in again.', async () => {
              setSigningOut(true);
              await signOut();
            }, 'Sign out')
          }
        />
      </Card>
      <T muted small>Owner session authenticated · Requests use live data from the Bara server</T>
    </AdminScreen>
  );
}
