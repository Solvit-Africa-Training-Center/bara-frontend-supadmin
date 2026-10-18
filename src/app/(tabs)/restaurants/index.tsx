import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { accountTone, managerName, placeOf, statusLabel, tierLabel, useRestaurants } from '@/api/restaurants';
import type { SuperAdminRestaurant } from '@/api/types';
import { AdminScreen, Card, Input, Label, LinkArrow, LoadState, Pill, Row, T } from '@/components/ui';
import { colors, fonts } from '@/theme';

type Filter = 'all' | 'active' | 'attention';

export default function Restaurants() {
  const { restaurants, loading, error, reload } = useRestaurants();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const q = query.trim().toLowerCase();
  const activeCount = restaurants.filter((r) => r.account_status === 'active').length;
  const shown = restaurants.filter(
    (r) =>
      (filter === 'all' || (filter === 'active' ? r.account_status === 'active' : r.account_status !== 'active')) &&
      (!q || [r.name, r.manager?.full_name, r.code, r.city].some((v) => v?.toLowerCase().includes(q))),
  );

  const chip = (f: Filter, label: string, tone: 'neutral' | 'green' | 'yellow') => (
    <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: filter === f ? colors.text : 'transparent' }}>
      <Pill label={label} tone={tone} onPress={() => setFilter(f)} />
    </View>
  );

  const open = (id: string) => router.push({ pathname: '/restaurants/[id]', params: { id } });

  const renderRestaurantItem = ({ item: r }: { item: SuperAdminRestaurant }) => (
    <Pressable onPress={() => open(r.id)}>
      <Card style={{ paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: fonts.bodyMedium, fontSize: 15.5, marginBottom: 2 }}>{r.name}</T>
            <T muted>{managerName(r)}</T>
          </View>
          <Pill label={statusLabel[r.account_status] ?? r.account_status} tone={accountTone[r.account_status] ?? 'neutral'} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <T muted small>
            {tierLabel(r)} · {placeOf(r)}
          </T>
          <LinkArrow label="View" onPress={() => open(r.id)} />
        </View>
        <T muted small style={{ marginTop: 6 }}>
          #{r.code} · {r.setup_completed ? 'Setup complete' : 'Setup not finished'}
        </T>
      </Card>
    </Pressable>
  );

  const ListHeader = (
    <View>
      <Label>Search tenants</Label>
      <Row gap={10} style={{ flexWrap: 'nowrap', marginBottom: 12 }}>
        <Input style={{ flex: 1 }} placeholder="Name, manager or code..." value={query} onChangeText={setQuery} />
        <Pressable
          onPress={() => router.push('/restaurants/new')}
          style={{ height: 44, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Feather name="plus" size={16} color="#fff" />
          <T style={{ color: '#fff', fontFamily: fonts.bodySemi, fontSize: 14.5 }}>Add</T>
        </Pressable>
      </Row>

      <Row gap={8} style={{ marginBottom: 10, flexWrap: 'wrap' }}>
        {chip('all', `All · ${restaurants.length}`, 'neutral')}
        {chip('active', `Active · ${activeCount}`, 'green')}
        {chip('attention', `Not active · ${restaurants.length - activeCount}`, 'yellow')}
      </Row>
      <T muted style={{ marginBottom: 12 }}>
        One location per account · Tap to review access
      </T>

      <LoadState loading={loading && restaurants.length === 0} error={error} onRetry={reload} />
    </View>
  );

  const ListEmpty = !loading && !error ? (
    <T muted style={{ marginTop: 8 }}>
      {restaurants.length ? 'No restaurants match.' : 'No restaurants yet.'}
    </T>
  ) : null;

  return (
    <AdminScreen title="Restaurants" showOwner scroll={false}>
      <FlatList
        data={shown}
        keyExtractor={(r) => r.id}
        renderItem={renderRestaurantItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading && restaurants.length > 0}
            onRefresh={reload}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
      />
    </AdminScreen>
  );
}
