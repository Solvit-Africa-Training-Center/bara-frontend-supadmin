import { AdminScreen, Card, H, LoadState, Pill, Row, T } from '@/components/ui';
import { formatDateTime, paymentRef, usePayments } from '@/api/payments';
import { accountTone, statusLabel, useRestaurants } from '@/api/restaurants';
import type { AccountStatus } from '@/api/types';

const statuses: AccountStatus[] = ['active', 'pending_payment', 'grace', 'restricted', 'locked', 'archived'];

export default function PlatformReports() {
  const live = useRestaurants();
  const api = usePayments();
  const refreshing = live.loading || api.loading;
  const reload = () => Promise.all([live.reload(), api.reload()]).then(() => undefined);
  const pending = api.payments.filter((payment) => payment.status === 'pending').length;
  const paid = api.payments.filter((payment) => payment.status === 'paid').length;
  const rejected = api.payments.filter((payment) => payment.status === 'rejected').length;
  const recentPayments = api.payments.slice(0, 5);

  return (
    <AdminScreen title="Platform reports" back="More / Reports" refreshing={refreshing} onRefresh={reload}>
      <T muted small style={{ marginBottom: 12 }}>Live counts from platform restaurants, payment confirmations, and subscription plans.</T>
      <LoadState loading={live.loading && live.restaurants.length === 0} error={live.error} onRetry={live.reload} />
      <LoadState loading={api.loading && api.payments.length === 0} error={api.error} onRetry={api.reload} />

      <Card>
        <H>Restaurant accounts · {live.restaurants.length}</H>
        <Row gap={8}>
          {statuses.map((status) => (
            <Pill
              key={status}
              label={`${statusLabel[status]} · ${live.restaurants.filter((restaurant) => restaurant.account_status === status).length}`}
              tone={accountTone[status]}
            />
          ))}
        </Row>
      </Card>

      <Card>
        <H>Restaurants by subscription tier</H>
        {api.plans.map((plan) => (
          <Row key={plan.tier} style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
            <T>{plan.name} · {plan.currency} {plan.price.toLocaleString('en-US')} / {plan.billing_period}</T>
            <T strong>{live.restaurants.filter((restaurant) => restaurant.subscription_tier === plan.tier).length}</T>
          </Row>
        ))}
        {!api.loading && api.plans.length === 0 && !api.error ? <T muted>No plans returned by the server.</T> : null}
      </Card>

      <Card>
        <H>Payment confirmations</H>
        <Row gap={8} style={{ marginBottom: 12 }}>
          <Pill label={`Pending · ${pending}`} tone="yellow" />
          <Pill label={`Approved · ${paid}`} tone="green" />
          <Pill label={`Rejected · ${rejected}`} tone="red" />
        </Row>
        {recentPayments.length ? recentPayments.map((payment) => (
          <T key={payment.id} style={{ marginBottom: 8 }}>
            {paymentRef(payment)} · {payment.restaurant_name || payment.payer_name} · {payment.status} · {formatDateTime(payment.submitted_at)}
          </T>
        )) : !api.loading && !api.error ? <T muted>No payment confirmations returned by the server.</T> : null}
      </Card>

      <T muted small style={{ marginBottom: 14 }}>
        This API does not expose platform billing totals, historical revenue, or operational flags. No sales or billing figures are estimated here.
      </T>
    </AdminScreen>
  );
}
