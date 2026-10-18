import { View } from 'react-native';
import { router } from 'expo-router';
import { formatDateTime, paymentRef, usePayments } from '@/api/payments';
import { useRestaurants } from '@/api/restaurants';
import { AdminScreen, Btn, Card, H, LinkArrow, LoadState, Pill, Row, T, useOwnerName } from '@/components/ui';
import { useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const owner = useOwnerName();
  const api = usePayments();
  const live = useRestaurants();
  // Renewals and support have no API endpoints yet; they still come from sample data.
  const { restaurants, payments, session } = useStore();
  const active = live.restaurants.filter((r) => r.account_status === 'active').length;
  const grace = live.restaurants.filter((r) => r.account_status === 'grace').length;
  const overdue = live.restaurants.length - active;
  const pending = api.payments.filter((p) => p.status === 'pending');
  const lastDecision = api.payments.find((p) => p.verified_at);

  const renewal = payments.find((p) => !p.applied);
  const renewalTenant = restaurants.find((r) => r.id === renewal?.tenantId);
  const supportTenant = restaurants.find((r) => r.id === session.restaurantId);

  const attention = [
    ...pending.slice(0, renewalTenant?.status === 'Grace' && !session.resolved ? 1 : 2).map((p) => ({
      key: p.id,
      name: p.restaurant_name || p.payer_name,
      detail: `${paymentRef(p)} · Payment submitted · ${formatDateTime(p.submitted_at)}`,
      action: 'Review',
      go: () => router.push({ pathname: '/requests/[id]', params: { id: p.id } }),
    })),
    renewalTenant?.status === 'Grace' && {
      key: 'pay',
      name: renewalTenant.name,
      detail: '4 days overdue · Renewal ready',
      action: 'Payment',
      go: () => router.push({ pathname: '/more/subscriptions', params: { tenant: renewalTenant.id } }),
    },
    !session.resolved && {
      key: 'sup',
      name: supportTenant?.name ?? '',
      detail: `${session.ticket} · Stock guidance needed`,
      action: 'Support',
      go: () => router.push('/more/support'),
    },
  ].filter(Boolean) as { key: string; name: string; detail: string; action: string; go: () => void }[];

  return (
    <AdminScreen
      title={`${greeting()}, ${owner}`}
      showEyebrow
      showOwner
      refreshing={api.loading || live.loading}
      onRefresh={() => Promise.all([api.reload(), live.reload()])}
    >
      <LoadState loading={false} error={api.error} onRetry={api.reload} />
      <Row gap={10} style={{ marginBottom: 12, flexWrap: 'nowrap' }}>
        <Card style={{ flex: 1, marginBottom: 0, padding: 14 }}>
          <T muted small>Active accounts</T>
          <T numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, marginVertical: 6 }}>
            {live.loading && live.restaurants.length === 0 ? '…' : `${active} / ${live.restaurants.length}`}
          </T>
          <T muted small>
            Plus {grace} in grace
          </T>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0, padding: 14 }}>
          <T muted small>Pending requests</T>
          <T numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, marginVertical: 6 }}>
            {api.loading && api.payments.length === 0 ? '…' : pending.length}
          </T>
          <T muted small>
            Ready for your review
          </T>
        </Card>
      </Row>

      <Card>
        <H style={{ marginBottom: 4 }}>Needs your attention</H>
        {attention.length === 0 ? <T muted style={{ paddingVertical: 10 }}>Nothing needs your attention.</T> : null}
        {attention.map((a) => (
          <View
            key={a.key}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 10 }}
          >
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: fonts.bodyMedium, fontSize: 15, marginBottom: 2 }}>{a.name}</T>
              <T muted small>
                {a.detail}
              </T>
            </View>
            <LinkArrow label={a.action} onPress={a.go} />
          </View>
        ))}
      </Card>

      <Card muted>
        <H>Platform billing</H>
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 16, marginBottom: 8 }}>RWF 220,000 received</T>
        <T muted style={{ marginBottom: 10 }}>
          October to date · Sample data until the billing API is ready. Not restaurant sales.
        </T>
        <Row gap={8}>
          <Pill label={`${overdue} not active`} tone="yellow" onPress={() => router.push('/restaurants')} />
          <Pill label="2 support tickets" tone="plain" onPress={() => router.push('/more/support')} />
        </Row>
      </Card>

      <H style={{ marginTop: 4 }}>More destinations</H>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <Btn label="Subscriptions" style={{ flex: 1.18, paddingHorizontal: 2 }} onPress={() => router.push('/more/subscriptions')} />
        <Btn label="Support" style={{ flex: 0.91, paddingHorizontal: 2 }} onPress={() => router.push('/more/support')} />
        <Btn label="Reports" style={{ flex: 0.91, paddingHorizontal: 2 }} onPress={() => router.push('/more/reports')} />
      </View>
      <T muted small>
        Available from More · Owner session authenticated
        {lastDecision?.verified_at ? ` · Last decision: ${paymentRef(lastDecision)} at ${formatDateTime(lastDecision.verified_at)}` : ''}
      </T>
    </AdminScreen>
  );
}
