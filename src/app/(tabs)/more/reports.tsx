import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  AdminScreen,
  Btn,
  Card,
  DateRangePicker,
  type DateRangeValue,
  Gap,
  H,
  InfoBox,
  Label,
  notify,
  Pill,
  Row,
  T,
} from '@/components/ui';
import { useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

// Sample paid-subscription totals from the Figma frame (thousands of RWF).
const months = [
  { m: 'May', v: 120, monthIdx: 4 },
  { m: 'Jun', v: 148, monthIdx: 5 },
  { m: 'Jul', v: 136, monthIdx: 6 },
  { m: 'Aug', v: 175, monthIdx: 7 },
  { m: 'Sep', v: 194, monthIdx: 8 },
  { m: 'Oct', v: 220, monthIdx: 9 },
];

export default function PlatformReports() {
  const { restaurants } = useStore();
  const [range, setRange] = useState<DateRangeValue>({
    startDate: new Date(2026, 9, 1),
    endDate: new Date(2026, 9, 8),
    label: '01–08 Oct 2026',
  });

  const count = (s: string) => restaurants.filter((r) => r.status === s).length;
  const max = Math.max(...months.map((x) => x.v));

  // Determine active months and receipt totals based on selected date range
  const { totalRevenue, activeMonthIndices, subtitle } = useMemo(() => {
    const activeIndices = months
      .filter((x) => {
        const mDate = new Date(2026, x.monthIdx, 15);
        return mDate >= range.startDate && mDate <= range.endDate;
      })
      .map((x) => x.monthIdx);

    if (activeIndices.length === 0 || (activeIndices.length === 1 && activeIndices[0] === 9)) {
      return {
        totalRevenue: 220000,
        activeMonthIndices: [9],
        subtitle: `${range.label || 'October to date'} · Bara billing, not restaurant sales`,
      };
    }

    if (activeIndices.length === 1 && activeIndices[0] === 8) {
      return {
        totalRevenue: 194000,
        activeMonthIndices: [8],
        subtitle: 'September 2026 · Bara billing, not restaurant sales',
      };
    }

    const sum = months
      .filter((x) => activeIndices.includes(x.monthIdx))
      .reduce((acc, curr) => acc + curr.v * 1000, 0);

    return {
      totalRevenue: sum || 220000,
      activeMonthIndices: activeIndices.length ? activeIndices : [9],
      subtitle: `${range.label || 'Selected period'} · Bara billing, not restaurant sales`,
    };
  }, [range]);

  const rangeDisplay =
    range.label ||
    `${range.startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${range.endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  return (
    <AdminScreen title="Platform reports" back="More / Reports" demo>
      <Label>Date range</Label>
      <DateRangePicker startDate={range.startDate} endDate={range.endDate} onChange={setRange} />
      <T muted small style={{ marginTop: 10, marginBottom: 14 }}>
        Refreshed 09:40 · Africa/Kigali · Demo dataset
      </T>

      <Card>
        <H>Paid subscription receipts</H>
        <T style={{ fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, marginBottom: 6 }}>
          RWF {totalRevenue.toLocaleString('en-US')}
        </T>
        <T muted style={{ marginBottom: 12 }}>
          {subtitle}
        </T>
        <T muted style={{ marginBottom: 10 }}>
          Paid subscriptions · sample RWF totals
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 8, paddingHorizontal: 4 }}>
          {months.map((x) => {
            const isActive = activeMonthIndices.includes(x.monthIdx);
            return (
              <View
                key={x.m}
                style={{
                  flex: 1,
                  height: `${(x.v / max) * 100}%`,
                  backgroundColor: isActive ? colors.primary : '#E8A23A',
                  opacity: activeMonthIndices.length === months.length || isActive ? 1 : 0.45,
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                }}
              />
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4, marginTop: 6, marginBottom: 10 }}>
          {months.map((x) => (
            <T key={x.m} muted small style={{ flex: 1, textAlign: 'center', fontSize: 11 }}>
              {x.m}
            </T>
          ))}
        </View>
        <T muted small>
          RWF {months.map((x) => `${x.v}k`).join(' · ')} ({rangeDisplay})
        </T>
      </Card>

      <Card muted>
        <H>Renewals & account health</H>
        <Row style={{ marginBottom: 10, flexWrap: 'wrap' }} gap={8}>
          <Pill label={`${count('Active')} Active`} tone="green" />
          <Pill label={`${count('Grace')} Grace`} tone="yellow" />
          <Pill label={`${count('Restricted')} Restricted`} tone="red" />
          <Pill label={`${count('Locked')} Locked`} tone="red" />
          <Pill label={`${count('Archived')} Archived`} tone="plain" />
        </Row>
        <T style={{ fontSize: 13.5, lineHeight: 19 }}>
          2 renewals due this month · {restaurants.filter((r) => r.status !== 'Active').length} overdue 4 of {restaurants.length} accounts synced today{' '}
          {count('Active') + count('Grace')} accounts have full tier access, including grace
        </T>
      </Card>

      <InfoBox title="Practical next step">
        Apply Nyamirambo Kitchen’s verified renewal before grace ends. Follow up on Kivu Table’s unverified payment evidence.
      </InfoBox>

      <Card>
        <H>Flagged operations</H>
        <T style={{ fontSize: 13.5, lineHeight: 19, marginBottom: 10 }}>Kigali Heights: oil usage +31% vs prior week; 7 evening voids vs 2.</T>
        <T muted style={{ marginBottom: 12 }}>
          Synced 09:38 · Aggregate tenant summaries. A flag is not proof of an error.
        </T>
        <Btn label="Inspect in read-only support" onPress={() => router.push('/more/support')} />
      </Card>

      <T muted small style={{ marginBottom: 14 }}>
        Sources: billing ledger, account states and synced tenant summaries. No raw staff data in insights. Forecast unavailable: insufficient consistent history.
      </T>
      <Btn
        label="Export platform summary"
        onPress={() => notify('Summary exported', `The platform summary for ${rangeDisplay} is ready to share.`)}
      />
      <Gap h={4} />
    </AdminScreen>
  );
}
