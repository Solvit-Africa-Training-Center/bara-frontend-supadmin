import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, notify, Pill, PlanFeatures, Row, Select, T } from '@/components/ui';
import { firstName, statusTone, useStore, type Status } from '@/data/store';
import { fonts } from '@/theme';

const actions: { value: Status; label: string }[] = [
  { value: 'Restricted', label: 'Restrict access' },
  { value: 'Locked', label: 'Lock account' },
  { value: 'Archived', label: 'Archive account' },
  { value: 'Active', label: 'Reactivate account' },
];

const effect = (target: Status, manager: string) =>
  ({
    Restricted: `All tier tools become read-only. Confirm after review; notify ${manager} and log Derrick, reason and time.`,
    Locked: `Staff cannot sign in until the account is reactivated. Notify ${manager} and log Derrick, reason and time.`,
    Archived: `The tenant is hidden from daily operations and keeps its history. Notify ${manager} and log Derrick, reason and time.`,
    Active: `Full tier access returns. Notify ${manager} and log Derrick, reason and time.`,
    Grace: '',
  })[target];

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurants, setStatus } = useStore();
  const r = restaurants.find((x) => x.id === id);
  const [action, setAction] = useState<Status>(r?.status === 'Active' ? 'Restricted' : 'Active');
  const [reason, setReason] = useState('');

  if (!r) {
    return (
      <AdminScreen title="Restaurant" back="Restaurants" demo>
        <T muted>Restaurant not found.</T>
      </AdminScreen>
    );
  }

  const options = actions.filter((a) => a.value !== r.status);
  const paid = r.status === 'Active' || r.status === 'Grace';

  const submit = () => {
    if (!reason.trim()) return notify('Reason required', 'Enter a reason before changing the account status.');
    confirm(`${r.status} → ${action}`, effect(action, firstName(r.manager)), () => {
      setStatus(r.id, action, reason.trim());
      setReason('');
      setAction(action === 'Active' ? 'Restricted' : 'Active');
      notify('Status changed', `${r.name} is now ${action}. ${firstName(r.manager)} has been notified.`);
    });
  };

  return (
    <AdminScreen title={r.name} back="Restaurants" demo>
      <Row style={{ marginBottom: 14 }} gap={14}>
        <Pill label={r.status} tone={statusTone[r.status]} />
        <T muted>
          #{r.code} · {r.location}
        </T>
      </Row>

      <Card>
        <H>Manager & access</H>
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 18.5, marginBottom: 10 }}>{r.manager} · Primary manager</T>
        <T style={{ marginBottom: 10 }}>
          {r.email} · {r.phone}
        </T>
        <T muted style={{ marginBottom: 14 }}>
          {r.invitation} · This tenant only. No platform-admin permissions.
        </T>
        <Btn label="Resend access instructions" onPress={() => notify('Access instructions sent', `${r.manager} will receive sign-in instructions at ${r.email}.`)} />
      </Card>

      <Card muted>
        <H>Plan & validity</H>
        <PlanFeatures plan={r.plan} />
        <T style={{ fontFamily: fonts.bodySemi, fontSize: 18.5, marginTop: 6, marginBottom: 10 }}>Paid through {r.paidThrough}</T>
        <T muted style={{ marginBottom: 14 }}>
          {paid ? `Current paid account · Full ${r.plan} access` : `${r.status} account · ${r.plan} access suspended`}
        </T>
        <Btn label="Review subscription / payment" onPress={() => router.push({ pathname: '/more/subscriptions', params: { tenant: r.id } })} />
      </Card>

      <Card>
        <H>Operational summary</H>
        <T style={{ marginBottom: 10 }}>{r.operations?.synced ?? `Last sync ${r.lastSync} · ${r.syncNote}`}</T>
        <T style={{ marginBottom: 14 }}>{r.operations?.flags ?? 'No flags from synced summaries.'}</T>
        <Btn label="Open read-only support" variant="primary" onPress={() => router.push({ pathname: '/more/support', params: { tenant: r.id } })} />
      </Card>

      <Card>
        <H>Manage account status</H>
        <Label>Action</Label>
        <Select value={action} options={options} onChange={setAction} />
        <Gap h={12} />
        <Label>Reason · required</Label>
        <Input placeholder="Manager-requested temporary review" value={reason} onChangeText={setReason} />
        <Gap h={12} />
        <InfoBox title={`${r.status} → ${action}`} tone="yellow">
          {effect(action, firstName(r.manager))}
        </InfoBox>
        <Btn label="Review & confirm change" onPress={submit} />
      </Card>
    </AdminScreen>
  );
}
