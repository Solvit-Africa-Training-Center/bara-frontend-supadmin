import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, PageHeader, Screen, StatusBadge, styles } from '@/components/ui';
import { formatRwf, useStore, type RestaurantStatus } from '@/data/store';
import { colors } from '@/theme';

const filters: ('all' | RestaurantStatus)[] = ['all', 'active', 'pending', 'suspended'];

export default function Restaurants() {
  const { restaurants } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const shown = restaurants.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.district.toLowerCase().includes(q)),
  );
  const count = (f: (typeof filters)[number]) => (f === 'all' ? restaurants.length : restaurants.filter((r) => r.status === f).length);

  return (
    <Screen>
      <PageHeader
        eyebrow="Super Admin"
        title="Restaurants"
        subtitle="Every restaurant using Bara, with its manager and status."
        right={<Button label="+ Add" small onPress={() => router.push('/restaurant/new')} />}
      />

      <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }]}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, code or district"
          placeholderTextColor="#B09A88"
          style={{ flex: 1, fontSize: 15, color: colors.text, padding: 0 }}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
        {filters.map((f) => (
          <Chip
            key={f}
            label={`${f[0].toUpperCase() + f.slice(1)} (${count(f)})`}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      {shown.length === 0 ? <Text style={styles.muted}>No restaurants match.</Text> : null}

      {shown.map((r) => (
        <Pressable key={r.id} onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: r.id } })}>
          {({ pressed }) => (
            <Card style={{ opacity: pressed ? 0.85 : 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.strong}>{r.name}</Text>
                  <Text style={styles.muted}>
                    #{r.code} · {r.district} · {r.plan}
                  </Text>
                </View>
                <StatusBadge status={r.status} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'flex-end' }}>
                <View>
                  <Text style={styles.muted}>Manager</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{r.manager.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.muted}>Today</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>{formatRwf(r.todaySales)}</Text>
                </View>
              </View>
            </Card>
          )}
        </Pressable>
      ))}
    </Screen>
  );
}
