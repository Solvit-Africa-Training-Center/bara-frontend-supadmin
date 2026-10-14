import Feather from '@expo/vector-icons/Feather';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Row, SectionTitle, StatusBadge, styles } from '@/components/ui';
import { formatRwf, useStore } from '@/data/store';
import { colors } from '@/theme';

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onYes },
  ]);
}

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurants, setStatus } = useStore();
  const r = restaurants.find((x) => x.id === id);

  if (!r) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.muted}>Restaurant not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: r.name }} />
      <Text style={styles.eyebrow}>#{r.code}</Text>
      <Text style={styles.title}>{r.name}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 16 }}>
        <StatusBadge status={r.status} />
        <Badge label={r.plan} tone="primary" />
        <Badge label={`Synced ${r.lastSync}`} />
      </View>

      <Card>
        <Text style={styles.muted}>Today's sales</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.brand }}>{formatRwf(r.todaySales)}</Text>
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 24 }}>
          <View>
            <Text style={styles.muted}>Orders</Text>
            <Text style={styles.strong}>{r.ordersToday}</Text>
          </View>
          <View>
            <Text style={styles.muted}>Staff</Text>
            <Text style={styles.strong}>{r.staff}</Text>
          </View>
          <View>
            <Text style={styles.muted}>Joined</Text>
            <Text style={styles.strong}>{r.joined}</Text>
          </View>
        </View>
      </Card>

      <SectionTitle>Manager access</SectionTitle>
      <Card>
        <Row label="Name" value={r.manager.name} />
        <Row label="Phone" value={r.manager.phone} />
        <Row label="Email" value={r.manager.email} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Button label="Resend invite" variant="outline" small icon={<Feather name="send" size={14} color={colors.text} />} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Reset PIN" variant="outline" small icon={<Feather name="key" size={14} color={colors.text} />} />
          </View>
        </View>
      </Card>

      <SectionTitle>Key details</SectionTitle>
      <Card muted>
        <Row label="District" value={r.district} />
        <Row label="Address" value={r.address} />
        <Row label="Subscription" value={`${r.plan} plan`} />
      </Card>

      {r.status === 'pending' ? (
        <Card style={{ backgroundColor: colors.warningSoft, borderColor: '#F3D99B' }}>
          <Text style={styles.strong}>Waiting for approval</Text>
          <Text style={[styles.muted, { marginBottom: 12 }]}>Approve to let the manager sign in and start taking orders.</Text>
          <Button label="Approve restaurant" onPress={() => setStatus(r.id, 'active')} />
        </Card>
      ) : null}

      {r.status === 'active' ? (
        <Button
          label="Suspend restaurant"
          variant="danger"
          onPress={() =>
            confirm('Suspend restaurant?', `${r.name} staff will be signed out and cannot take orders.`, () => setStatus(r.id, 'suspended'))
          }
        />
      ) : null}
      {r.status === 'suspended' ? <Button label="Reactivate restaurant" onPress={() => setStatus(r.id, 'active')} /> : null}
    </ScrollView>
  );
}
