import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, notify, Page, Row, SectionTitle, styles } from '@/components/ui';
import { formatRwf, useStore, type Restaurant } from '@/data/store';
import { colors } from '@/theme';

const plans: { name: Restaurant['plan']; price: number; features: string }[] = [
  { name: 'Starter', price: 15000, features: '1 POS device · Menu & orders · Daily report' },
  { name: 'Standard', price: 35000, features: '3 POS devices · Inventory · Staff roles' },
  { name: 'Premium', price: 60000, features: 'Unlimited devices · Waste log · Insights · Priority support' },
];

export default function Billing() {
  const { restaurants } = useStore();
  const price = (p: Restaurant['plan']) => plans.find((x) => x.name === p)!.price;
  const paying = restaurants.filter((r) => r.status === 'active');
  const monthly = paying.reduce((s, r) => s + price(r.plan), 0);
  const overdue = restaurants.filter((r) => r.status === 'suspended');

  return (
    <Page>
      <Text style={styles.eyebrow}>Plans & billing</Text>
      <Text style={styles.title}>Subscriptions</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>What restaurants pay each month and who is behind on payment.</Text>

      <Card>
        <Text style={styles.muted}>Expected this month</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.brand }}>{formatRwf(monthly)}</Text>
        <Text style={styles.muted}>{paying.length} paying restaurants</Text>
      </Card>

      <SectionTitle>Plans</SectionTitle>
      {plans.map((p) => {
        const count = restaurants.filter((r) => r.plan === p.name).length;
        return (
          <Card key={p.name}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.strong}>{p.name}</Text>
              <Badge label={`${count} restaurant${count === 1 ? '' : 's'}`} tone="primary" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 6 }}>{formatRwf(p.price)} / month</Text>
            <Text style={styles.muted}>{p.features}</Text>
          </Card>
        );
      })}

      <SectionTitle>Overdue payments</SectionTitle>
      {overdue.length === 0 ? (
        <Card muted>
          <Text style={styles.muted}>No overdue payments.</Text>
        </Card>
      ) : (
        overdue.map((r) => (
          <Card key={r.id} style={{ borderColor: '#F1B5B5' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.strong}>{r.name}</Text>
              <Badge label="Overdue" tone="danger" />
            </View>
            <Row label="Plan" value={r.plan} />
            <Row label="Amount due" value={formatRwf(price(r.plan))} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Button label="Send reminder" small onPress={() => notify('Reminder sent', `${r.manager.name} received a payment reminder by SMS.`)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Open restaurant" variant="outline" small onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: r.id } })} />
              </View>
            </View>
          </Card>
        ))
      )}
    </Page>
  );
}
