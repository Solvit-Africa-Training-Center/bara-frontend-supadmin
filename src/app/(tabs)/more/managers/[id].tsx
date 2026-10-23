import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getManager } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { SuperAdminManager } from '@/api/types';
import { AdminScreen, Btn, Card, H, LoadState, Pill, T } from '@/components/ui';

export default function ManagerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [manager, setManager] = useState<SuperAdminManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try { setManager(await getManager(id)); setError(null); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  return (
    <AdminScreen title={manager?.full_name || 'Manager'} back="Managers" refreshing={loading} onRefresh={load}>
      <LoadState loading={loading} error={error} onRetry={load} />
      {manager ? <>
        <Card>
          <H>Account</H>
          <Pill label={manager.is_active ? 'Active' : 'Inactive'} tone={manager.is_active ? 'green' : 'neutral'} />
          <T style={{ marginTop: 12 }}>{manager.email || 'No email provided'}</T>
          <T>{manager.phone_number || 'No phone provided'}</T>
          <T muted small style={{ marginTop: 8 }}>Added {new Date(manager.created_at).toLocaleDateString()}</T>
        </Card>
        <Card>
          <H>Assigned restaurant</H>
          <T strong>{manager.restaurant_name}</T>
          <T muted>#{manager.restaurant_code}</T>
          <Btn label="View restaurant" onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: manager.restaurant_id } })} />
        </Card>
      </> : null}
    </AdminScreen>
  );
}
