import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Chip, PageHeader, Screen, styles } from '@/components/ui';
import { reviewRequests } from '@/data/reviews';
import { useStore, type RequestItem } from '@/data/store';
import { colors } from '@/theme';

const kindTone = { access: 'primary', support: 'warning', billing: 'danger' } as const;

export default function Requests() {
  const { requests, restaurants, resolveRequest, setStatus } = useStore();
  const [showResolved, setShowResolved] = useState(false);
  const shown = requests.filter((r) => r.resolved === showResolved);

  const approve = (q: RequestItem) => {
    if (q.title.startsWith('Approve')) setStatus(q.restaurantId, 'active');
    resolveRequest(q.id);
  };

  return (
    <Screen>
      <PageHeader eyebrow="Super Admin" title="Requests" subtitle="Approvals, access problems and billing issues from restaurants." />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Chip label={`Open (${requests.filter((r) => !r.resolved).length})`} active={!showResolved} onPress={() => setShowResolved(false)} />
        <Chip label="Resolved" active={showResolved} onPress={() => setShowResolved(true)} />
      </View>

      {!showResolved
        ? reviewRequests
            .filter((r) => r.status === 'Pending')
            .map((r) => (
              <Pressable key={r.id} onPress={() => router.push({ pathname: '/request/[id]', params: { id: r.id } })}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Badge label={`${r.id} · ${r.status}`} tone="warning" />
                    <Text style={styles.muted}>{r.submitted}</Text>
                  </View>
                  <Text style={styles.strong}>{r.restaurant}</Text>
                  <Text style={styles.muted}>
                    {r.location} · {r.plan} · RWF {r.payment.amount.toLocaleString('en-US')}
                  </Text>
                  <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>Review request →</Text>
                </Card>
              </Pressable>
            ))
        : null}

      {shown.length === 0 ? <Text style={styles.muted}>Nothing here.</Text> : null}

      {shown.map((q) => {
        const r = restaurants.find((x) => x.id === q.restaurantId);
        return (
          <Card key={q.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <Text style={[styles.strong, { flex: 1 }]}>{q.title}</Text>
              <Badge label={q.kind} tone={kindTone[q.kind]} />
            </View>
            <Text style={[styles.muted, { marginBottom: 4 }]}>
              {r?.name} · {q.createdAt}
            </Text>
            <Text style={{ fontSize: 14, color: '#4A3A2E', marginBottom: 12 }}>{q.detail}</Text>
            {q.resolved ? (
              <Badge label="Resolved" tone="success" />
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button label={q.title.startsWith('Approve') ? 'Approve' : 'Mark resolved'} small onPress={() => approve(q)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Open restaurant"
                    variant="outline"
                    small
                    onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: q.restaurantId } })}
                  />
                </View>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
