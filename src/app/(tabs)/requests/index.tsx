import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { formatDateTime, paymentRef, usePayments } from '@/api/payments';
import type { PaymentConfirmation } from '@/api/types';
import { AdminScreen, Btn, Card, InfoBox, Input, Label, LoadState, Pill, Row, T } from '@/components/ui';
import { colors, fonts } from '@/theme';

const title = (p: PaymentConfirmation) => p.restaurant_name || p.payer_name;
const outcome = (p: PaymentConfirmation) =>
  p.status === 'paid' ? `${title(p)}: payment approved, subscription active` : `${title(p)}: payment rejected${p.rejection_reason ? ` (${p.rejection_reason})` : ''}`;

export default function Requests() {
  const { payments, loading, error, reload } = usePayments();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'Pending' | 'Completed'>('Pending');

  const q = query.trim().toLowerCase();
  const match = (p: PaymentConfirmation) =>
    !q || [title(p), p.payer_name, p.payer_phone, paymentRef(p)].some((v) => v.toLowerCase().includes(q));
  const pending = payments.filter((p) => p.status === 'pending');
  const completed = payments.filter((p) => p.status !== 'pending');
  const shownPending = pending.filter(match);
  const shownCompleted = completed.filter(match);

  const chip = (t: typeof tab, label: string, tone: 'yellow' | 'neutral') => (
    <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: tab === t ? colors.text : 'transparent' }}>
      <Pill label={label} tone={tone} onPress={() => setTab(t)} />
    </View>
  );

  return (
    <AdminScreen title="Requests" showOwner refreshing={loading} onRefresh={reload}>
      <Label>Search requests</Label>
      <Input placeholder="Restaurant, payer or reference..." value={query} onChangeText={setQuery} />
      <Row style={{ marginVertical: 14 }}>
        {chip('Pending', `Pending · ${pending.length}`, 'yellow')}
        {chip('Completed', `Completed · ${completed.length}`, 'neutral')}
      </Row>

      <LoadState loading={loading && payments.length === 0} error={error} onRetry={reload} />

      {tab === 'Pending' && !loading && !error && shownPending.length === 0 ? (
        <T muted style={{ marginBottom: 14 }}>
          {q ? 'No pending requests match.' : 'No pending requests. New payment confirmations from restaurants appear here.'}
        </T>
      ) : null}

      {tab === 'Pending'
        ? shownPending.map((p) => (
            <Card key={p.id}>
              <Row gap={14} style={{ marginBottom: 12 }}>
                <Pill label="Payment confirmation" tone="neutral" />
                <T muted>{formatDateTime(p.submitted_at)}</T>
              </Row>
              <T style={{ fontFamily: fonts.bodyMedium, fontSize: 17, marginBottom: 10 }}>{title(p)}</T>
              <T muted style={{ marginBottom: 10 }}>
                {p.payer_name} · {paymentRef(p)}
              </T>
              <T style={{ marginBottom: 14 }}>
                {p.tier ? `${p.tier.toUpperCase()} requested · ` : ''}Payment submitted · Waiting for your check
              </T>
              <Btn label="Review & decide" onPress={() => router.push({ pathname: '/requests/[id]', params: { id: p.id } })} />
            </Card>
          ))
        : null}

      {shownCompleted.length > 0 ? (
        <InfoBox title="Completed decisions">{shownCompleted.map((p) => `${paymentRef(p)} · ${outcome(p)}`).join('\n')}</InfoBox>
      ) : tab === 'Completed' && !loading && !error ? (
        <T muted>No completed decisions yet.</T>
      ) : null}
    </AdminScreen>
  );
}
