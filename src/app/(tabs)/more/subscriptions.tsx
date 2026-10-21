import { View } from 'react-native';
import { router } from 'expo-router';
import { formatDateTime, paymentRef, usePayments } from '@/api/payments';
import { accountTone, statusLabel, useRestaurants } from '@/api/restaurants';
import { AdminScreen, Btn, Card, H, LoadState, Pill, Row, T } from '@/components/ui';

export default function Subscription() {
  const api = usePayments();
  const live = useRestaurants();
  const refreshing = api.loading || live.loading;
  const reload = () => Promise.all([api.reload(), live.reload()]).then(() => undefined);
  const pending = api.payments.filter((payment) => payment.status === 'pending');

  return (
    <AdminScreen title="Subscriptions & payments" back="More / Subscriptions" refreshing={refreshing} onRefresh={reload}>
      <LoadState loading={api.loading && api.payments.length === 0} error={api.error} onRetry={api.reload} />
      <LoadState loading={live.loading && live.restaurants.length === 0} error={live.error} onRetry={live.reload} />

      <Card>
        <H>Subscription plans</H>
        {api.plans.map((plan) => (
          <ViewPlan key={plan.tier} name={plan.name} price={`${plan.currency} ${plan.price.toLocaleString('en-US')} / ${plan.billing_period}`} features={plan.features} />
        ))}
        {!api.loading && api.plans.length === 0 && !api.error ? <T muted>No subscription plans returned by the server.</T> : null}
      </Card>

      <Card>
        <H>Restaurant subscription status</H>
        {live.restaurants.map((restaurant) => (
          <Row key={restaurant.id} style={{ justifyContent: 'space-between', paddingVertical: 7 }}>
            <View style={{ flex: 1 }}>
              <T strong>{restaurant.name}</T>
              <T muted small>{restaurant.subscription_tier.toUpperCase()} · #{restaurant.code}</T>
            </View>
            <Pill label={statusLabel[restaurant.account_status]} tone={accountTone[restaurant.account_status]} />
          </Row>
        ))}
        {!live.loading && !live.restaurants.length && !live.error ? <T muted>No restaurants returned by the server.</T> : null}
      </Card>

      <Card>
        <H>Payment confirmations · {pending.length} pending</H>
        {api.payments.map((payment) => (
          <View key={payment.id} style={{ paddingVertical: 8 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <T strong>{payment.restaurant_name || payment.payer_name}</T>
              <Pill
                label={payment.status === 'paid' ? 'Approved' : payment.status === 'rejected' ? 'Rejected' : 'Pending'}
                tone={payment.status === 'paid' ? 'green' : payment.status === 'rejected' ? 'red' : 'yellow'}
              />
            </Row>
            <T muted small>{paymentRef(payment)} · {formatDateTime(payment.submitted_at)}</T>
            {payment.status === 'pending' ? (
              <Btn label="Review payment" onPress={() => router.push({ pathname: '/requests/[id]', params: { id: payment.id } })} />
            ) : null}
          </View>
        ))}
        {!api.loading && !api.payments.length && !api.error ? <T muted>No payment confirmations returned by the server.</T> : null}
      </Card>
      <T muted small>Payment approvals are handled through the review flow; the API does not expose a separate manual renewal or payment-application action.</T>
    </AdminScreen>
  );
}

function ViewPlan({ name, price, features }: { name: string; price: string; features: string[] }) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T strong>{name}</T>
        <T>{price}</T>
      </Row>
      {features.map((feature) => <T key={feature} muted small style={{ marginTop: 4 }}>· {feature}</T>)}
    </View>
  );
}
