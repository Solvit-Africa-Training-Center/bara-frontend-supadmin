import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getRestaurant, type RestaurantAction } from '@/api/admin';
import { errorMessage } from '@/api/client';
import { formatDateTime, usePayments } from '@/api/payments';
import { accountTone, managerName, placeOf, statusLabel, tierLabel, useRestaurants } from '@/api/restaurants';
import type { AccountStatus } from '@/api/types';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, LoadState, notify, Pill, PlanFeatures, Row, Select, T } from '@/components/ui';
import { fonts } from '@/theme';

const firstName = (name: string) => name.split(' ')[0] || name;

const actions: { value: RestaurantAction; label: string; result: AccountStatus; effect: string }[] = [
  { value: 'restrict', label: 'Restrict access', result: 'restricted', effect: 'All tier tools become read-only until the account is reactivated.' },
  { value: 'lock', label: 'Lock account', result: 'locked', effect: 'Staff cannot sign in until the account is reactivated.' },
  { value: 'extend-grace', label: 'Extend grace period', result: 'grace', effect: 'The restaurant keeps access for a longer grace period while payment is sorted out.' },
  { value: 'reactivate', label: 'Reactivate account', result: 'active', effect: 'Full tier access returns.' },
];

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurants, loading: listLoading, error: listError, changeStatus } = useRestaurants();
  const { plans } = usePayments();
  const cached = restaurants.find((x) => x.id === id);
  const [detail, setDetail] = useState<typeof cached>(cached);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try { setDetail(await getRestaurant(id)); setError(null); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  const r = detail ?? cached;
  const options = actions.filter((a) => a.result !== r?.account_status);
  const [action, setAction] = useState<RestaurantAction>(r?.account_status === 'active' ? 'restrict' : 'reactivate');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!r) {
    return (
      <AdminScreen title="Restaurant" back="Restaurants" refreshing={loading || listLoading} onRefresh={load}>
        <LoadState loading={loading && !listLoading} error={error ?? listError} onRetry={load} />
        {!loading && !error && !listLoading && !listError ? <T muted>Restaurant not found.</T> : null}
      </AdminScreen>
    );
  }

  const chosen = options.find((a) => a.value === action) ?? options[0];
  const status = statusLabel[r.account_status] ?? r.account_status;
  const plan = plans.find((item) => item.tier === r.subscription_tier);
  const manager = r.manager;

  const submit = () => {
    if (!reason.trim()) return notify('Reason required', 'Enter a reason before changing the account status.');
    confirm(`${status} → ${statusLabel[chosen.result]}`, chosen.effect, async () => {
      setSaving(true);
      try {
        const updated = await changeStatus(r.id, chosen.value, reason.trim());
        setDetail(updated);
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
    <AdminScreen title={r.name} back="Restaurants" refreshing={loading} onRefresh={load}>
      <Row style={{ marginBottom: 14 }} gap={14}>
        <Pill label={status} tone={accountTone[r.account_status] ?? 'neutral'} />
        <T muted>
          #{r.code} · {placeOf(r)}
        </T>
      </Row>

      <Card>
        <H>Manager & access</H>
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 15.5, marginBottom: 8 }}>
          {managerName(r)} · Primary manager
        </T>
        <T style={{ marginBottom: 8 }}>
          {[manager?.email, manager?.phone_number || r.phone].filter(Boolean).join(' · ') || 'No contact details'}
        </T>
        <T muted>
          {manager ? (manager.is_active ? 'Manager account active' : 'Manager account inactive') : 'Restaurant phone shown'} · This tenant only. No platform-admin
          permissions.
        </T>
      </Card>

      <Card muted>
        <H>Plan & setup</H>
        {plan ? <PlanFeatures plan={plan.name} features={plan.features} /> : <T muted>Plan features are unavailable.</T>}
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 15.5, marginTop: 6, marginBottom: 8 }}>
          {tierLabel(r)} plan · {status}
        </T>
        <T muted style={{ marginBottom: 12 }}>
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
