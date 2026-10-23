import { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { listManagers } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { SuperAdminManager } from '@/api/types';
import { AdminScreen, Card, H, Input, LoadState, T } from '@/components/ui';

export default function Managers() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<SuperAdminManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await listManagers(search.trim())); setError(null); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);

  return (
    <AdminScreen title="Managers" back="More" refreshing={loading} onRefresh={load}>
      <Card>
        <H>Manager accounts</H>
        <T muted small style={{ marginBottom: 10 }}>View-only directory from the Bara server.</T>
        <Input value={search} onChangeText={setSearch} placeholder="Search name, email, phone, or restaurant" autoCapitalize="none" />
      </Card>
      <LoadState loading={loading} error={error} onRetry={load} />
      {items.map((manager) => (
        <Pressable key={manager.id} onPress={() => router.push({ pathname: '/more/managers/[id]', params: { id: manager.id } })}>
          <Card>
            <T strong>{manager.full_name}</T>
            <T muted>{manager.restaurant_name} · {manager.restaurant_code}</T>
            <T muted small>{manager.email || manager.phone_number} · {manager.is_active ? 'Active' : 'Inactive'}</T>
          </Card>
        </Pressable>
      ))}
      {!loading && !error && items.length === 0 ? <T muted>No managers found.</T> : null}
    </AdminScreen>
  );
}
