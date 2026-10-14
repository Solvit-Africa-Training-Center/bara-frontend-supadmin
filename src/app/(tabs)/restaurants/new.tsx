import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Btn, Card, Gap, H, InfoBox, Input, Label, notify, Pill, PlanFeatures, Row, T } from '@/components/ui';
import { firstName, rwf, useStore } from '@/data/store';

export default function AddRestaurant() {
  const { requests, createFromRequest } = useStore();
  // The Figma flow creates tenants from a verified onboarding request.
  const source = requests.find((r) => r.kind === 'New restaurant' && r.status === 'Pending');

  const [name, setName] = useState(source?.restaurant ?? '');
  const [location, setLocation] = useState(source?.location ?? '');
  const [manager, setManager] = useState(source?.manager ?? '');
  const [email, setEmail] = useState(source?.email ?? '');

  if (!source) {
    return (
      <AdminScreen title="Add restaurant & manager access" back="Restaurants">
        <InfoBox title="No verified onboarding request" tone="yellow">
          A restaurant is created from a paid onboarding request after its payment is verified. New requests appear in Requests.
        </InfoBox>
        <Btn label="Go to Requests" onPress={() => router.push('/requests')} />
      </AdminScreen>
    );
  }

  const create = () => {
    if (!name.trim() || !location.trim() || !manager.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return notify('Check the details', 'Restaurant name, location, manager name and a valid invitation email are required.');
    }
    const created = createFromRequest(source.id, { name: name.trim(), location: location.trim(), manager: manager.trim(), email: email.trim() });
    notify('Restaurant created', `${created.name} is Active. ${firstName(created.manager)} will receive access instructions by email.`);
    router.replace({ pathname: '/restaurants/[id]', params: { id: created.id } });
  };

  const p = source.payment!;

  return (
    <AdminScreen title="Add restaurant & manager access" back="Restaurants">
      <Row style={{ marginBottom: 12 }} gap={14}>
        <Pill label="1 Details" tone="green" />
        <Pill label="2 Manager" tone="green" />
        <Pill label="3 Paid access" tone="green" />
      </Row>
      <T muted style={{ marginBottom: 14 }}>
        Prefilled from {source.id} · Review before creating
      </T>

      <Card>
        <H>Restaurant</H>
        <Label>Restaurant name</Label>
        <Input value={name} onChangeText={setName} />
        <Gap h={12} />
        <Label>One location</Label>
        <Input value={location} onChangeText={setLocation} />
        <Gap h={12} />
        {source.venueContact ? <T muted>{source.venueContact}</T> : null}
      </Card>

      <Card>
        <H>Primary manager</H>
        <Label>Full name</Label>
        <Input value={manager} onChangeText={setManager} />
        <Gap h={12} />
        <Label>Invitation email</Label>
        <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Gap h={12} />
        <T muted>{source.phone} · Contact confirmed</T>
      </Card>

      <Card muted>
        <H>Paid access review</H>
        <Row style={{ marginBottom: 12 }} gap={14}>
          <Pill label={`${p.reference} · ${p.verified ? 'Verified' : 'Not verified'}`} tone={p.verified ? 'green' : 'yellow'} />
          <Pill label={source.plan} tone="plain" />
        </Row>
        <T style={{ marginBottom: 12 }}>MTN Mobile Money · {rwf(p.amount)} (sample)</T>
        <Row gap={14} style={{ flexWrap: 'nowrap', marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Label>Starts</Label>
            <Input value={source.period?.start} editable={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Label>Paid through</Label>
            <Input value={source.period?.end} editable={false} />
          </View>
        </Row>
        <PlanFeatures plan={source.plan} />
        <T style={{ marginTop: 6 }}>Result: Active · Manager can use {name || source.restaurant} only. No AI or platform access.</T>
      </Card>

      <InfoBox title="Ready to invite">
        Payment, manager and duplicate checks passed. Creates one tenant and logs Derrick’s action. Secure invitation expires in 72 hours.
      </InfoBox>
      <Btn label="Create restaurant & send invite" variant="primary" onPress={create} />
      <T muted small style={{ marginTop: 12 }}>
        {firstName(manager || source.manager)} will receive access instructions by email. Sample payment is not an official plan price.
      </T>
    </AdminScreen>
  );
}
