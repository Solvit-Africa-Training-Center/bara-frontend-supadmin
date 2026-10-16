import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import type { RestaurantAction } from '@/api/admin';
import { errorMessage } from '@/api/client';
import { formatDateTime } from '@/api/payments';
import { accountTone, managerName, placeOf, statusLabel, tierLabel, useRestaurants } from '@/api/restaurants';
import type { AccountStatus } from '@/api/types';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, LoadState, notify, Pill, PlanFeatures, Row, Select, T } from '@/components/ui';
import { firstName, type Plan } from '@/data/store';
import { fonts } from '@/theme';

const actions: { value: RestaurantAction; label: string; result: AccountStatus; effect: string }[] = [
  { value: 'restrict', label: 'Restrict access', result: 'restricted', effect: 'All tier tools become read-only until the account is reactivated.' },
  { value: 'lock', label: 'Lock account', result: 'locked', effect: 'Staff cannot sign in until the account is reactivated.' },
  { value: 'extend-grace', label: 'Extend grace period', result: 'grace', effect: 'The restaurant keeps access for a longer grace period while payment is sorted out.' },
  { value: 'reactivate', label: 'Reactivate account', result: 'active', effect: 'Full tier access returns.' },
];

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurants, loading, error, reload, changeStatus } = useRestaurants();
  const r = restaurants.find((x) => x.id === id);
  const options = actions.filter((a) => a.result !== r?.account_status);
  const [action, setAction] = useState<RestaurantAction>(r?.account_status === 'active' ? 'restrict' : 'reactivate');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!r) {
    return (
      <AdminScreen title="Restaurant" back="Restaurants">
        <LoadState loading={loading} error={error} onRetry={reload} />
        {!loading && !error ? <T muted>Restaurant not found.</T> : null}
      </AdminScreen>
    );
  }

  const chosen = options.find((a) => a.value === action) ?? options[0];
  const status = statusLabel[r.account_status] ?? r.account_status;
  const plan = (r.subscription_tier?.toUpperCase() || 'BASIC') as Plan;
  const manager = r.manager;

  const submit = () => {
    if (!reason.trim()) return notify('Reason required', 'Enter a reason before changing the account status.');
    confirm(`${status} → ${statusLabel[chosen.result]}`, chosen.effect, async () => {
      setSaving(true);
      try {
        const updated = await changeStatus(r.id, chosen.value, reason.trim());
        setReason('');
        setAction(updated.account_status === 'active' ? 'restrict' : 'reactivate');
        notify('Status changed', `${r.name} is now ${statusLabel[updated.account_status] ?? updated.account_status}.`);
      } catch (e) {
        notify('Could not change status', errorMessage(e));
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <AdminScreen title={r.name} back="Restaurants" refreshing={loading} onRefresh={reload}>
      <Row style={{ marginBottom: 14 }} gap={14}>
        <Pill label={status} tone={accountTone[r.account_status] ?? 'neutral'} />
        <T muted>
          #{r.code} · {placeOf(r)}
        </T>
      </Row>

      <Card>
        <H>Manager & access</H>
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 18.5, marginBottom: 10 }}>
          {managerName(r)} · Primary manager
        </T>
        <T style={{ marginBottom: 10 }}>
          {[manager?.email, manager?.phone_number || r.phone].filter(Boolean).join(' · ') || 'No contact details'}
        </T>
        <T muted>
          {manager ? (manager.is_active ? 'Manager account active' : 'Manager account inactive') : 'Restaurant phone shown'} · This tenant only. No platform-admin
          permissions.
        </T>
      </Card>

      <Card muted>
        <H>Plan & setup</H>
        <PlanFeatures plan={plan} />
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 18.5, marginTop: 6, marginBottom: 10 }}>
          {tierLabel(r)} plan · {status}
        </T>
        <T muted style={{ marginBottom: 14 }}>
          {r.setup_completed ? 'Setup complete' : 'Setup not finished'} · Joined {formatDateTime(r.created_at)}
        </T>
        <Btn label="Review payment requests" onPress={() => router.push('/requests')} />
      </Card>

      {options.length ? (
        <Card>
          <H>Manage account status</H>
          <Label>Action</Label>
          <Select value={chosen.value} options={options} onChange={setAction} />
          <Gap h={12} />
          <Label>Reason · required</Label>
          <Input placeholder="Manager-requested temporary review" value={reason} onChangeText={setReason} />
          <Gap h={12} />
          <InfoBox title={`${status} → ${statusLabel[chosen.result]}`} tone="yellow">
            {chosen.effect} {firstName(manager?.full_name || 'The manager')} will see the change on their next sign-in.
          </InfoBox>
          <Btn label={saving ? 'Saving…' : 'Review & confirm change'} onPress={saving ? () => {} : submit} />
        </Card>
      ) : null}
    </AdminScreen>
  );
}
