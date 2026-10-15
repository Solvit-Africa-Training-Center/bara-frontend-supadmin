import { View } from 'react-native';
import { router } from 'expo-router';
import { formatDateTime, paymentRef, usePayments } from '@/api/payments';
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
  // Restaurants, renewals and support have no API endpoints yet; they still come from sample data.
  const { restaurants, payments, session } = useStore();
  const active = restaurants.filter((r) => r.status === 'Active').length;
  const grace = restaurants.filter((r) => r.status === 'Grace').length;
  const overdue = restaurants.filter((r) => r.status !== 'Active').length;
  const pending = api.payments.filter((p) => p.status === 'pending');
  const lastDecision = api.payments.find((p) => p.verified_at);

  const renewal = payments.find((p) => !p.applied);
  const renewalTenant = restaurants.find((r) => r.id === renewal?.tenantId);
  const supportTenant = restaurants.find((r) => r.id === session.restaurantId);

  const attention = [
    ...pending.slice(0, 3).map((p) => ({
      key: p.id,
      name: p.restaurant_name || p.payer_name,
      detail: `${paymentRef(p)} · Payment submitted · ${formatDateTime(p.submitted_at)}`,
      action: 'Review',
      go: () => router.push({ pathname: '/requests/[id]', params: { id: p.id } }),
    })),
    renewalTenant?.status === 'Grace' && {
      key: 'pay',
      name: renewalTenant.name,
      detail: '4 days overdue · Renewal ready · Sample',
      action: 'Payment',
      go: () => router.push({ pathname: '/more/subscriptions', params: { tenant: renewalTenant.id } }),
    },
    !session.resolved && {
      key: 'sup',
      name: supportTenant?.name ?? '',
      detail: `${session.ticket} · Stock guidance needed · Sample`,
      action: 'Support',
      go: () => router.push('/more/support'),
    },
  ].filter(Boolean) as { key: string; name: string; detail: string; action: string; go: () => void }[];

  return (
    <AdminScreen title={`${greeting()}, ${owner}`} showOwner refreshing={api.loading} onRefresh={api.reload}>
      <LoadState loading={false} error={api.error} onRetry={api.reload} />
      <Row gap={14} style={{ marginBottom: 14, flexWrap: 'nowrap' }}>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <T muted>Active accounts</T>
          <T style={{ fontFamily: fonts.heading, fontSize: 34, lineHeight: 45, marginVertical: 8 }}>
            {active} / {restaurants.length}
          </T>
          <T muted small>
            Plus {grace} in grace · Sample
          </T>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <T muted>Pending requests</T>
          <T style={{ fontFamily: fonts.heading, fontSize: 34, lineHeight: 45, marginVertical: 8 }}>{api.loading && api.payments.length === 0 ? '…' : pending.length}</T>
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
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 10 }}
          >
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: fonts.bodyMedium, fontSize: 17.5, marginBottom: 3 }}>{a.name}</T>
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
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 18.5, marginBottom: 10 }}>RWF 220,000 received</T>
        <T muted style={{ marginBottom: 12 }}>
          October to date · Sample data until the billing API is ready. Not restaurant sales.
        </T>
        <Row>
          <Pill label={`${overdue} overdue accounts`} tone="yellow" onPress={() => router.push('/restaurants')} />
          <Pill label="2 support tickets" tone="plain" onPress={() => router.push('/more/support')} />
        </Row>
      </Card>

      <H style={{ marginTop: 4 }}>More destinations</H>
      <Row style={{ marginBottom: 14 }}>
        <Btn label="Subscriptions" onPress={() => router.push('/more/subscriptions')} />
        <Btn label="Support" onPress={() => router.push('/more/support')} />
        <Btn label="Reports" onPress={() => router.push('/more/reports')} />
      </Row>
      <T muted small>
        Available from More · Owner session authenticated
        {lastDecision?.verified_at ? ` · Last decision: ${paymentRef(lastDecision)} at ${formatDateTime(lastDecision.verified_at)}` : ''}
      </T>
    </AdminScreen>
  );
}
