import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminPage, Badge, Card, styles } from '@/components/ui';
import { colors } from '@/theme';

// Sample totals from the Figma "Platform reports" frame (thousands of RWF).
const months = [
  { m: 'May', v: 120 },
  { m: 'Jun', v: 148 },
  { m: 'Jul', v: 136 },
  { m: 'Aug', v: 175 },
  { m: 'Sep', v: 194 },
  { m: 'Oct', v: 220 },
];

const ranges = ['01–08 Oct 2026', 'Sep 2026', 'Last 6 months'];

export default function PlatformReports() {
  const [range, setRange] = useState(ranges[0]);
  const [open, setOpen] = useState(false);
  const max = Math.max(...months.map((x) => x.v));

  return (
    <AdminPage back="More / Reports" title="Platform reports">
      <Text style={[styles.label, { fontSize: 14 }]}>Date range</Text>
      <Pressable onPress={() => setOpen(!open)} style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={{ fontSize: 15, color: colors.text }}>{range}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
      </Pressable>
      {open ? (
        <Card style={{ paddingVertical: 4, marginTop: 4 }}>
          {ranges.map((r) => (
            <Pressable key={r} onPress={() => { setRange(r); setOpen(false); }} style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 15, color: r === range ? colors.primary : colors.text, fontWeight: r === range ? '700' : '400' }}>{r}</Text>
            </Pressable>
          ))}
        </Card>
      ) : null}
      <Text style={[styles.muted, { marginTop: 10, marginBottom: 16, fontSize: 12 }]}>Refreshed 09:40 · Africa/Kigali · Demo dataset</Text>

      <Card>
        <Text style={[styles.strong, { marginBottom: 12 }]}>Paid subscription receipts</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>RWF 220,000</Text>
        <Text style={[styles.muted, { marginBottom: 16 }]}>October to date · Bara billing, not restaurant sales</Text>
        <Text style={[styles.muted, { marginBottom: 12 }]}>Paid subscriptions · sample RWF totals</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, height: 110 }}>
          {months.map((x, i) => (
            <View
              key={x.m}
              style={{
                flex: 1,
                height: `${(x.v / max) * 100}%`,
                backgroundColor: i === months.length - 1 ? colors.primary : '#E8A23A',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 12 }}>
          {months.map((x) => (
            <Text key={x.m} style={[styles.muted, { flex: 1, textAlign: 'center' }]}>
              {x.m}
            </Text>
          ))}
        </View>
        <Text style={[styles.muted, { fontSize: 12 }]}>RWF {months.map((x) => `${x.v}k`).join(' · ')} (Oct to date)</Text>
      </Card>

      <Card muted>
        <Text style={[styles.strong, { marginBottom: 12 }]}>Renewals & account health</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Badge label="2 Active" tone="success" />
          <Badge label="1 Grace" tone="warning" />
          <Badge label="1 Restricted" tone="danger" />
        </View>
      </Card>
    </AdminPage>
  );
}
