import Feather from '@expo/vector-icons/Feather';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, BaraLogo, Button, Card, Screen, SectionTitle, styles } from '@/components/ui';
import { formatRwf, useStore } from '@/data/store';
import { colors } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const { restaurants, requests, activity } = useStore();
  const active = restaurants.filter((r) => r.status === 'active').length;
  const open = requests.filter((r) => !r.resolved);
  const sales = restaurants.reduce((s, r) => s + r.todaySales, 0);
  const orders = restaurants.reduce((s, r) => s + r.ordersToday, 0);
  const offline = restaurants.filter((r) => r.status === 'active' && r.lastSync.includes('day'));

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <BaraLogo />
        <Badge label="Super Admin" tone="primary" />
      </View>

      <Text style={styles.eyebrow}>Platform overview</Text>
      <Text style={styles.title}>{greeting()}, Patrick</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>Here is what is happening across Bara today.</Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Text style={styles.muted}>Active restaurants</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 6 }}>
            {active}/{restaurants.length}
          </Text>
          <Text style={styles.muted}>on the platform</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={styles.muted}>Open requests</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 6 }}>{open.length}</Text>
          <Text style={styles.muted}>need a decision</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.muted}>Sales across all restaurants today</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.brand, marginTop: 4 }}>{formatRwf(sales)}</Text>
        <Text style={styles.muted}>{orders} orders recorded</Text>
      </Card>

      <SectionTitle right={<Button label="See all" variant="ghost" small onPress={() => router.push('/(tabs)/requests')} />}>
        Needs your attention
      </SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {open.length === 0 ? (
          <Text style={[styles.muted, { paddingVertical: 12 }]}>All caught up.</Text>
        ) : (
          open.slice(0, 3).map((q, i) => {
            const r = restaurants.find((x) => x.id === q.restaurantId);
            return (
              <Pressable
                key={q.id}
                onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: q.restaurantId } })}
                style={{
                  paddingVertical: 12,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.strong}>{r?.name}</Text>
                  <Text style={styles.muted}>{q.title}</Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Review</Text>
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </Pressable>
            );
          })
        )}
      </Card>

      <SectionTitle>Platform health</SectionTitle>
      <Card muted>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Feather name="check-circle" size={18} color={colors.success} />
          <Text style={styles.strong}>{offline.length ? `${offline.length} restaurant offline` : 'All POS devices synced'}</Text>
        </View>
        <Text style={styles.muted}>
          Offline orders are stored on each device and upload automatically once the connection returns.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Badge label="API online" tone="success" />
          <Badge label="Payments online" tone="success" />
        </View>
      </Card>

      <SectionTitle>Recent activity</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {activity.slice(0, 5).map((a, i) => (
          <View
            key={a.id}
            style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border, flexDirection: 'row', gap: 12 }}
          >
            <Text style={[styles.muted, { flex: 1, color: colors.text }]}>{a.text}</Text>
            <Text style={styles.muted}>{a.time}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
