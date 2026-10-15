import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Card, Input, Label, LinkArrow, Pill, Row, T } from '@/components/ui';
import { statusTone, useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

type Filter = 'all' | 'active' | 'overdue';

export default function Restaurants() {
  const { restaurants } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const q = query.trim().toLowerCase();
  const activeCount = restaurants.filter((r) => r.status === 'Active').length;
  const shown = restaurants.filter(
    (r) =>
      (filter === 'all' || (filter === 'active' ? r.status === 'Active' : r.status !== 'Active')) &&
      (!q || r.name.toLowerCase().includes(q) || r.manager.toLowerCase().includes(q)),
  );

  const chip = (f: Filter, label: string, tone: 'neutral' | 'green' | 'yellow') => (
    <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: filter === f ? colors.text : 'transparent' }}>
      <Pill label={label} tone={tone} onPress={() => setFilter(f)} />
    </View>
  );

  return (
    <AdminScreen title="Restaurants" showOwner demo>
      <Label>Search tenants</Label>
      <Row gap={14} style={{ flexWrap: 'nowrap', marginBottom: 14 }}>
        <Input style={{ flex: 1 }} placeholder="Name or manager..." value={query} onChangeText={setQuery} />
        <Pressable
          onPress={() => router.push('/restaurants/new')}
          style={{ height: 48, paddingHorizontal: 18, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Feather name="plus" size={18} color="#fff" />
          <T style={{ color: '#fff', fontFamily: fonts.bodySemi, fontSize: 17.5 }}>Add</T>
        </Pressable>
      </Row>

      <Row style={{ marginBottom: 12 }}>
        {chip('all', `All · ${restaurants.length}`, 'neutral')}
        {chip('active', `Active · ${activeCount}`, 'green')}
        {chip('overdue', `Overdue · ${restaurants.length - activeCount}`, 'yellow')}
      </Row>
      <T muted style={{ marginBottom: 12 }}>
        One location per account · Tap to review access
      </T>

      {shown.length === 0 ? <T muted>No restaurants match.</T> : null}

      {shown.map((r) => (
        <Pressable key={r.id} onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: r.id } })}>
          <Card style={{ paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <T style={{ fontFamily: fonts.bodyMedium, fontSize: 18.5, marginBottom: 2 }}>{r.name}</T>
                <T muted>{r.manager}</T>
              </View>
              <Pill label={r.status} tone={statusTone[r.status]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <T muted small>
                {r.plan} · Paid through {r.paidThrough}
              </T>
              <LinkArrow label="View" onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: r.id } })} />
            </View>
            <T muted small style={{ marginTop: 6 }}>
              #{r.code} · Last sync {r.lastSync} · {r.syncNote}
            </T>
          </Card>
        </Pressable>
      ))}
    </AdminScreen>
  );
}
