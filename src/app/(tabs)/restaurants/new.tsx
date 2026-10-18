import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Btn, Card, Gap, H, InfoBox, Input, Label, notify, Pill, PlanFeatures, Row, T } from '@/components/ui';
import { firstName, rwf, useStore } from '@/data/store';

export default function AddRestaurant() {
  const { requests, createFromRequest } = useStore();
  // The Figma flow creates tenants from a verified onboarding request.
  const source = requests.find((r) => r.kind === 'New restaurant' && r.status === 'Pending');

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');
  const [email, setEmail] = useState('');

  if (!source) {
    return (
      <AdminScreen title="Add restaurant & manager access" back="Restaurants" demo>
        <InfoBox title="No verified onboarding request" tone="yellow">
          A restaurant is created from a paid onboarding request after its payment is verified. New requests appear in Requests.
        </InfoBox>
        <Btn label="Go to Requests" onPress={() => router.push('/requests')} />
      </AdminScreen>
    );
  }

  const create = () => {
    const finalName = name.trim();
    const finalLocation = location.trim();
    const finalManager = manager.trim();
    const finalEmail = email.trim();
    if (!finalName) return notify('Restaurant name required', 'Enter the restaurant name.');
    if (!finalLocation) return notify('Location required', 'Enter the restaurant location.');
    if (!finalManager) return notify('Manager required', 'Enter the primary manager name.');
    if (!finalEmail || !/^\S+@\S+\.\S+$/.test(finalEmail)) {
      return notify('Valid email required', 'Enter a valid invitation email.');
    }
    const created = createFromRequest(source.id, { name: finalName, location: finalLocation, manager: finalManager, email: finalEmail });
    notify('Restaurant created', `${created.name} is Active. ${firstName(created.manager)} will receive access instructions by email.`);
    router.replace({ pathname: '/restaurants/[id]', params: { id: created.id } });
  };

  const p = source.payment!;

  return (
    <AdminScreen title="Add restaurant & manager access" back="Restaurants" demo>
      <Row style={{ marginBottom: 12 }} gap={14}>
        <Pill label="1 Details" tone="green" />
        <Pill label="2 Manager" tone="green" />
        <Pill label="3 Paid access" tone="green" />
      </Row>

      <Card>
        <H>Restaurant</H>
        <Label>Restaurant name</Label>
        <Input value={name} onChangeText={setName} placeholder="e.g. Nyamirambo Kitchen" />
        <Gap h={12} />
        <Label>One location</Label>
        <Input value={location} onChangeText={setLocation} placeholder="e.g. KN 7 Ave, Kigali" />
      </Card>

      <Card>
        <H>Primary manager</H>
        <Label>Full name</Label>
        <Input value={manager} onChangeText={setManager} placeholder="e.g. Jeanette Uwase" />
        <Gap h={12} />
        <Label>Invitation email</Label>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="manager@restaurant.rw"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Card>

      <Card muted>
        <H>Paid access review</H>
        <Row style={{ marginBottom: 12 }} gap={14}>
          <Pill label={`${p.reference} · ${p.verified ? 'Verified' : 'Not verified'}`} tone={p.verified ? 'green' : 'yellow'} />
          <Pill label={source.plan} tone="plain" />
        </Row>
        <T style={{ marginBottom: 12 }}>MTN Mobile Money · {rwf(p.amount)} (sample)</T>
        <Row gap={10} style={{ flexWrap: 'nowrap', marginBottom: 12 }}>
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
        <T style={{ marginTop: 6 }}>Result: Active · Manager can use {name.trim() || 'the restaurant'} only. No AI or platform access.</T>
      </Card>

      <InfoBox title="Ready to invite">
        Payment, manager and duplicate checks passed. Creates one tenant and logs Derrick’s action. Secure invitation expires in 72 hours.
      </InfoBox>
      <Btn label="Create restaurant & send invite" variant="primary" onPress={create} />
      <T muted small style={{ marginTop: 12 }}>
        {firstName(manager.trim() || 'Manager')} will receive access instructions by email. Sample payment is not an official plan price.
      </T>
    </AdminScreen>
  );
}
