import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Btn, Card, InfoBox, Input, Label, Pill, Row, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

export default function Requests() {
  const { requests } = useStore();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'Pending' | 'Completed'>('Pending');

  const q = query.trim().toLowerCase();
  const match = (r: (typeof requests)[number]) => !q || r.restaurant.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  const pending = requests.filter((r) => r.status === 'Pending');
  const completed = requests.filter((r) => r.status === 'Completed');
  const shown = (tab === 'Pending' ? pending : completed).filter(match);

  const chip = (t: typeof tab, label: string, tone: 'yellow' | 'neutral') => (
    <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: tab === t ? colors.text : 'transparent' }}>
      <Pill label={label} tone={tone} onPress={() => setTab(t)} />
    </View>
  );

  return (
    <AdminScreen title="Requests" showOwner>
      <Label>Search requests</Label>
      <Input placeholder="Restaurant or request reference..." value={query} onChangeText={setQuery} />
      <Row style={{ marginVertical: 14 }}>
        {chip('Pending', `Pending · ${pending.length}`, 'yellow')}
        {chip('Completed', `Completed · ${completed.length}`, 'neutral')}
      </Row>

      {tab === 'Pending' && shown.length === 0 ? <T muted style={{ marginBottom: 14 }}>No pending requests.</T> : null}

      {tab === 'Pending'
        ? shown.map((r) => (
            <Card key={r.id}>
              <Row gap={14} style={{ marginBottom: 12 }}>
                <Pill label={r.kind} tone="neutral" />
                <T muted>{r.submitted}</T>
              </Row>
              <T style={{ fontFamily: fonts.bodyMedium, fontSize: 14, marginBottom: 10 }}>{r.restaurant}</T>
              <T muted style={{ marginBottom: 10 }}>
                {r.manager} · {r.id}
              </T>
              <T style={{ marginBottom: 14 }}>{r.summary}</T>
              <Btn label={r.kind === 'New restaurant' ? 'Review & decide' : 'Inspect request'} onPress={() => router.push({ pathname: '/requests/[id]', params: { id: r.id } })} />
            </Card>
          ))
        : null}

      {completed.filter(match).length > 0 ? (
        <InfoBox title="Completed decisions">{completed.filter(match).map((r) => `${r.id} · ${r.outcome}`).join('\n')}</InfoBox>
      ) : tab === 'Completed' ? (
        <T muted>No completed requests.</T>
      ) : null}
    </AdminScreen>
  );
}
