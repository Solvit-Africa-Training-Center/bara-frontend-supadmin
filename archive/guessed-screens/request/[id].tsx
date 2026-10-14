import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AdminPage, Badge, Button, Card, notify, styles } from '@/components/ui';
import { reviewRequests } from '@/data/reviews';
import { colors } from '@/theme';

export default function ReviewRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = reviewRequests.find((x) => x.id === id);

  if (!q) {
    return (
      <AdminPage back="Requests" title="Review request">
        <Text style={styles.muted}>Request not found.</Text>
      </AdminPage>
    );
  }

  return (
    <AdminPage back="Requests" title="Review request">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Badge label={`${q.id} · ${q.status}`} tone="warning" />
        <Text style={styles.muted}>{q.submitted}</Text>
      </View>

      <Card>
        <Text style={[styles.strong, { marginBottom: 8 }]}>{q.restaurant}</Text>
        <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 10 }}>
          {q.location} · {q.locations} {q.manager} · Primary manager
        </Text>
        <Text style={[styles.muted, { marginBottom: 10 }]}>
          {q.email} · {q.phone}
        </Text>
        <Text style={{ fontSize: 13, color: colors.text }}>{q.checks}</Text>
      </Card>

      <Card>
        <Text style={[styles.strong, { marginBottom: 8 }]}>Payment verification</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Badge label={q.payment.status} tone="success" />
          <Text style={styles.muted}>
            {q.payment.verifiedBy} · {q.payment.verifiedAt}
          </Text>
        </View>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          {q.payment.reference} · RWF {q.payment.amount.toLocaleString('en-US')}
        </Text>
        <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19, marginBottom: 12 }}>
          {q.payment.method} {q.payment.note}
        </Text>
        <Button
          label="View receipt evidence"
          variant="outline"
          onPress={() => notify('Receipt evidence', `${q.payment.reference}\nRWF ${q.payment.amount.toLocaleString('en-US')}\n${q.payment.method}`)}
        />
        <Text style={[styles.hint, { marginTop: 10 }]}>Sample amount, not an official plan price.</Text>
      </Card>

      <Card muted>
        <Text style={[styles.strong, { marginBottom: 10 }]}>Paid access to approve</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>{q.plan}</Text>
      </Card>
    </AdminPage>
  );
}
