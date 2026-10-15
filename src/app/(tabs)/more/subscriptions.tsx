import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, notify, Pill, PlanFeatures, Row, Select, T } from '@/components/ui';
import { firstName, rwf, statusTone, useStore, type Plan } from '@/data/store';
import { fonts } from '@/theme';

const plans: { value: Plan; label: string }[] = [
  { value: 'BASIC', label: 'BASIC' },
  { value: 'PRO', label: 'PRO' },
  { value: 'PREMIUM', label: 'PREMIUM' },
];

export default function Subscription() {
  const params = useLocalSearchParams<{ tenant?: string }>();
  const { restaurants, payments, applyPayment } = useStore();
  const [tenantId, setTenantId] = useState(params.tenant ?? payments.find((p) => !p.applied)?.tenantId ?? restaurants[0].id);
  const r = restaurants.find((x) => x.id === tenantId) ?? restaurants[0];
  const payment = payments.find((p) => p.tenantId === r.id);
  const [plan, setPlan] = useState<Plan>(r.plan);
  const [start, setStart] = useState('05 Oct 2026');
  const [through, setThrough] = useState('04 Nov 2026');
  const [reason, setReason] = useState('Verified renewal payment');

  const name = firstName(r.manager);
  const ready = payment && !payment.applied;

  const pickTenant = (id: string) => {
    setTenantId(id);
    setPlan(restaurants.find((x) => x.id === id)?.plan ?? 'PRO');
  };

  const activate = () => {
    if (!reason.trim()) return notify('Reason required', 'Enter a reason before applying the payment.');
    confirm('Confirm payment & activate?', `Full ${plan} access through ${through}. ${name} receives email + in-app confirmation.`, () => {
      applyPayment(r.id, plan, through);
      notify('Payment applied', `“Payment applied. ${r.name} is Active.” ${name} is notified and ${payment!.reference} is marked used.`);
    });
  };

  return (
    <AdminScreen title="Subscription & payment" back="More / Subscriptions" demo>
      <Label>Selected tenant</Label>
      <Select value={r.id} options={restaurants.map((x) => ({ value: x.id, label: `${x.name} · #${x.code}` }))} onChange={pickTenant} />
      <Gap h={14} />

      <Card>
        <H>Current access</H>
        <Row gap={14} style={{ marginBottom: 12 }}>
          <Pill label={r.plan} tone="neutral" />
          <Pill label={r.status === 'Grace' ? 'Grace · 4 days overdue' : r.status} tone={statusTone[r.status]} />
        </Row>
        <T>
          {r.manager} · Paid through {r.paidThrough}{' '}
          {r.status === 'Grace' ? 'Full tier access + reminders during grace' : r.status === 'Active' ? `Full ${r.plan} access` : 'Tier tools limited until payment is applied'}
        </T>
      </Card>

      {payment ? (
        <Card>
          <H>Verified payment</H>
          <View style={{ marginBottom: 12 }}>
            <Pill label={payment.applied ? 'Verified · Applied' : 'Verified · Not yet applied'} tone="green" />
          </View>
          <T style={{ fontFamily: fonts.bodyBold, fontSize: 20, marginBottom: 10 }}>
            {payment.reference} · {rwf(payment.amount)}
          </T>
          <T style={{ marginBottom: 12 }}>
            {payment.method} {payment.note}
          </T>
          <T muted small>
            Demo transaction, not an official plan price. Cash and bank transfers can also be verified.
          </T>
        </Card>
      ) : (
        <InfoBox title="No verified payment" tone="yellow">
          {`There is no verified payment waiting for ${r.name}. Verify a receipt first, then apply the paid period here.`}
        </InfoBox>
      )}

      {ready ? (
        <>
          <Card muted>
            <H>Apply paid period</H>
            <Label>Plan</Label>
            <Select value={plan} options={plans} onChange={setPlan} />
            <Gap h={12} />
            <Row gap={14} style={{ flexWrap: 'nowrap', marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Label>Start</Label>
                <Input value={start} onChangeText={setStart} />
              </View>
              <View style={{ flex: 1 }}>
                <Label>Paid through</Label>
                <Input value={through} onChangeText={setThrough} />
              </View>
            </Row>
            <PlanFeatures plan={plan} />
            <Gap h={6} />
            <Label>Reason</Label>
            <Input value={reason} onChangeText={setReason} />
          </Card>

          <InfoBox title={`Review outcome · ${r.status} → Active`}>
            Full {plan} access through {through.replace(' 2026', '')}. Reminders stop. {name} receives email + in-app confirmation. Derrick, reference, reason and dates are logged.
          </InfoBox>
          <Btn label="Confirm payment & activate" variant="primary" onPress={activate} />
          <Gap h={14} />
        </>
      ) : null}

      {payment ? (
        <InfoBox title={payment.applied ? 'Payment applied' : 'After confirmation'}>
          “Payment applied. {r.name} is Active.” {name} is notified and {payment.reference} is marked used, preventing a second application.
        </InfoBox>
      ) : null}
    </AdminScreen>
  );
}
