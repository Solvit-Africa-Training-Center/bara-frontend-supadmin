import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Btn, Card, Gap, H, InfoBox, Label, notify, Pill, Row, Select, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

// Sample paid-subscription totals from the Figma frame (thousands of RWF).
const months = [
  { m: 'May', v: 120 },
  { m: 'Jun', v: 148 },
  { m: 'Jul', v: 136 },
  { m: 'Aug', v: 175 },
  { m: 'Sep', v: 194 },
  { m: 'Oct', v: 220 },
];

const ranges = [
  { value: 'oct', label: '01–08 Oct 2026' },
  { value: 'sep', label: '01–30 Sep 2026' },
  { value: '6m', label: 'May–Oct 2026' },
] as const;

export default function PlatformReports() {
  const { restaurants } = useStore();
  const [range, setRange] = useState<(typeof ranges)[number]['value']>('oct');
  const count = (s: string) => restaurants.filter((r) => r.status === s).length;
  const max = Math.max(...months.map((x) => x.v));

  return (
    <AdminScreen title="Platform reports" back="More / Reports">
      <Label>Date range</Label>
      <Select value={range} options={[...ranges]} onChange={setRange} />
      <T muted small style={{ marginTop: 10, marginBottom: 14 }}>
        Refreshed 09:40 · Africa/Kigali · Demo dataset
      </T>

      <Card>
        <H>Paid subscription receipts</H>
        <T style={{ fontFamily: fonts.heading, fontSize: 26, lineHeight: 32, marginBottom: 8 }}>RWF 220,000</T>
        <T muted style={{ marginBottom: 14 }}>
          October to date · Bara billing, not restaurant sales
        </T>
        <T muted style={{ marginBottom: 12 }}>
          Paid subscriptions · sample RWF totals
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 96, gap: 12, paddingHorizontal: 4 }}>
          {months.map((x, i) => (
            <View
              key={x.m}
              style={{ flex: 1, height: `${(x.v / max) * 100}%`, backgroundColor: i === months.length - 1 ? colors.primary : '#E8A23A', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4, marginTop: 8, marginBottom: 10 }}>
          {months.map((x) => (
            <T key={x.m} muted small style={{ flex: 1, textAlign: 'center' }}>
              {x.m}
            </T>
          ))}
        </View>
        <T muted small>
          RWF {months.map((x) => `${x.v}k`).join(' · ')} (Oct to date)
        </T>
      </Card>

      <Card muted>
        <H>Renewals & account health</H>
        <Row style={{ marginBottom: 12 }} gap={14}>
          <Pill label={`${count('Active')} Active`} tone="green" />
          <Pill label={`${count('Grace')} Grace`} tone="yellow" />
          <Pill label={`${count('Restricted')} Restricted`} tone="red" />
          <Pill label={`${count('Locked')} Locked`} tone="red" />
          <Pill label={`${count('Archived')} Archived`} tone="plain" />
        </Row>
        <T style={{ fontSize: 13.5, lineHeight: 20 }}>
          2 renewals due this month · {restaurants.filter((r) => r.status !== 'Active').length} overdue 4 of {restaurants.length} accounts synced today{' '}
          {count('Active') + count('Grace')} accounts have full tier access, including grace
        </T>
      </Card>

      <InfoBox title="Practical next step">
        Apply Nyamirambo Kitchen’s verified renewal before grace ends. Follow up on Kivu Table’s unverified payment evidence.
      </InfoBox>

      <Card>
        <H>Flagged operations</H>
        <T style={{ fontSize: 13.5, lineHeight: 20, marginBottom: 12 }}>Kigali Heights: oil usage +31% vs prior week; 7 evening voids vs 2.</T>
        <T muted style={{ marginBottom: 14 }}>
          Synced 09:38 · Aggregate tenant summaries. A flag is not proof of an error.
        </T>
        <Btn label="Inspect in read-only support" onPress={() => router.push('/more/support')} />
      </Card>

      <T muted small style={{ marginBottom: 14 }}>
        Sources: billing ledger, account states and synced tenant summaries. No raw staff data in insights. Forecast unavailable: insufficient consistent history.
      </T>
      <Btn label="Export platform summary" onPress={() => notify('Summary exported', 'The platform summary for 01–08 Oct 2026 is ready to share.')} />
      <Gap h={4} />
    </AdminScreen>
  );
}
