import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { errorMessage } from '@/api/client';
import { formatDate, formatDateTime, paymentRef, usePayments } from '@/api/payments';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, notify, Pill, Row, T } from '@/components/ui';
import { colors, fonts } from '@/theme';

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

/** Parses "2026-10-15" as a local date; null when the text is not a real date. */
function parseDay(text: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

const statusPill = { pending: ['Pending', 'yellow'], paid: ['Approved', 'green'], rejected: ['Rejected', 'red'] } as const;

export default function ReviewRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { payments, plans, approve, reject } = usePayments();
  const p = payments.find((x) => x.id === id);
  const [start, setStart] = useState(isoDay(new Date()));
  const [end, setEnd] = useState(isoDay(addDays(new Date(), 30)));
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  if (!p) {
    return (
      <AdminScreen title="Review request" back="Requests">
        <T muted>This request is no longer available. Go back and pull down to refresh the list.</T>
      </AdminScreen>
    );
  }

  const name = p.restaurant_name || p.payer_name;
  const plan = p.tier ? plans.find((x) => x.name.toLowerCase() === p.tier) : undefined;
  const startDate = parseDay(start);
  const endDate = parseDay(end);
  const datesOk = !!startDate && !!endDate && endDate > startDate;
  const decided = p.status !== 'pending';

  const doApprove = () => {
    if (!datesOk) return notify('Check the dates', 'Use the format YYYY-MM-DD, and the end date must be after the start date.');
    confirm(
      'Approve & activate?',
      `${name}'s subscription becomes active from ${formatDate(startDate!)} to ${formatDate(endDate!)}.`,
      async () => {
        setBusy('approve');
        try {
          await approve(p.id, startDate!, endDate!);
          notify('Payment approved', `${name}'s subscription is now active.`);
          router.back();
        } catch (e) {
          notify('Could not approve', errorMessage(e));
        } finally {
          setBusy(null);
        }
      },
      'Approve',
    );
  };

  const doReject = () => {
    if (!reason.trim()) return notify('Rejection reason required', 'Explain what must be corrected before rejecting.');
    confirm(
      'Reject payment?',
      `Rejection grants no access. ${p.payer_name} will see this reason: “${reason.trim()}”`,
      async () => {
        setBusy('reject');
        try {
          await reject(p.id, reason.trim());
          notify('Payment rejected', 'The reason has been recorded.');
          router.back();
        } catch (e) {
          notify('Could not reject', errorMessage(e));
        } finally {
          setBusy(null);
        }
      },
      'Reject',
    );
  };

  return (
    <AdminScreen title="Review request" back="Requests">
      <Row gap={14} style={{ marginBottom: 14 }}>
        <Pill label={`${paymentRef(p)} · ${statusPill[p.status][0]}`} tone={statusPill[p.status][1]} />
        <T muted>{formatDateTime(p.submitted_at)}</T>
      </Row>

      <Card>
        <H>{name}</H>
        <T style={{ marginBottom: 10 }}>
          Payer {p.payer_name} · {p.payer_phone}
        </T>
        <T muted>Subscription {p.subscription.slice(0, 8).toUpperCase()}</T>
      </Card>

      <Card>
        <H>Payment verification</H>
        <Row gap={14} style={{ marginBottom: 12 }}>
          <Pill label={decided ? statusPill[p.status][0] : 'Submitted · Not verified yet'} tone={decided ? statusPill[p.status][1] : 'yellow'} />
          {p.verified_at ? <T muted>{formatDateTime(p.verified_at)}</T> : null}
        </Row>
        {p.amount ? <T style={{ fontFamily: fonts.bodyBold, fontSize: 18, marginBottom: 10 }}>RWF {p.amount.toLocaleString('en-US')}</T> : null}
        <T style={{ marginBottom: 6 }}>
          Paid by {p.payer_name} from {p.payer_phone}
        </T>
        {!decided ? (
          <T muted small>
            Check this payment in your Mobile Money or bank records before approving.
          </T>
        ) : null}
        {p.rejection_reason ? <T style={{ marginTop: 8, color: colors.redText }}>Reason: {p.rejection_reason}</T> : null}
      </Card>

      {plan ? (
        <Card muted>
          <H>Paid access to approve</H>
          <T style={{ fontFamily: fonts.bodySemi, color: colors.textMuted, marginLeft: 10, marginBottom: 8 }}>{plan.name.toUpperCase()}</T>
          {plan.features.map((f) => (
            <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Feather name="check" size={14} color={colors.text} />
              <T>{f}</T>
            </View>
          ))}
          <T muted style={{ marginTop: 4 }}>
            {plan.currency} {plan.price.toLocaleString('en-US')} / {plan.billing_period}
          </T>
        </Card>
      ) : null}

      {decided ? (
        <InfoBox title="Decision recorded">
          {p.status === 'paid' ? 'This payment was approved and the subscription is active.' : 'This payment was rejected. The restaurant can submit a new payment.'}
        </InfoBox>
      ) : (
        <>
          <Card muted>
            <H>Subscription period</H>
            <Row gap={14} style={{ flexWrap: 'nowrap' }}>
              <View style={{ flex: 1 }}>
                <Label>Starts</Label>
                <Input value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" autoCapitalize="none" />
              </View>
              <View style={{ flex: 1 }}>
                <Label>Paid through</Label>
                <Input value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" autoCapitalize="none" />
              </View>
            </Row>
            {!datesOk ? (
              <T small style={{ color: colors.redText, marginTop: 8 }}>
                Use YYYY-MM-DD; the end date must be after the start date.
              </T>
            ) : null}
          </Card>

          <InfoBox title="On approval">
            {datesOk
              ? `The subscription becomes active from ${formatDate(startDate!)} to ${formatDate(endDate!)} and the restaurant gets its paid access.`
              : 'Set valid dates to see the result.'}
          </InfoBox>
          <Btn label={busy === 'approve' ? 'Approving…' : 'Approve & activate'} variant="primary" disabled={!!busy} onPress={doApprove} />
          <Gap h={14} />
          <Label>Rejection reason · required to reject</Label>
          <Input placeholder="Explain what must be corrected..." value={reason} onChangeText={setReason} editable={!busy} />
          <Gap h={12} />
          <Btn label={busy === 'reject' ? 'Rejecting…' : 'Reject payment'} disabled={!!busy} onPress={doReject} />
          <T muted small style={{ marginTop: 12 }}>
            Rejection grants no access. The restaurant sees the reason and can submit a new payment.
          </T>
        </>
      )}
    </AdminScreen>
  );
}
