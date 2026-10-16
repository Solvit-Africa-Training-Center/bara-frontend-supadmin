import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { changeRestaurantStatus, listRestaurants, type RestaurantAction } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { AccountStatus, SuperAdminRestaurant } from '@/api/types';
import type { Tone } from '@/components/ui';

type Restaurants = {
  restaurants: SuperAdminRestaurant[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  changeStatus: (id: string, action: RestaurantAction, reason: string) => Promise<SuperAdminRestaurant>;
};

const RestaurantsContext = createContext<Restaurants | null>(null);

/** All restaurants on the platform, loaded from the Super Admin API. Mounted only while signed in. */
export function RestaurantsProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<SuperAdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      listRestaurants()
        .then((list) => {
          setRestaurants([...list].sort((a, b) => a.name.localeCompare(b.name)));
          setError(null);
        })
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false)),
    [],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = useCallback(async (id: string, action: RestaurantAction, reason: string) => {
    const updated = await changeRestaurantStatus(id, action, reason);
    setRestaurants((list) => list.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    return updated;
  }, []);

  const value = useMemo(() => ({ restaurants, loading, error, reload, changeStatus }), [restaurants, loading, error, reload, changeStatus]);
  return <RestaurantsContext.Provider value={value}>{children}</RestaurantsContext.Provider>;
}

export function useRestaurants() {
  const value = useContext(RestaurantsContext);
  if (!value) throw new Error('useRestaurants must be used inside <RestaurantsProvider>');
  return value;
}

export const statusLabel: Record<AccountStatus, string> = {
  pending_payment: 'Pending payment',
  active: 'Active',
  grace: 'Grace',
  restricted: 'Restricted',
  locked: 'Locked',
  archived: 'Archived',
};

export const accountTone: Record<AccountStatus, Tone> = {
  pending_payment: 'yellow',
  active: 'green',
  grace: 'yellow',
  restricted: 'red',
  locked: 'red',
  archived: 'neutral',
};

export const tierLabel = (r: SuperAdminRestaurant) => (r.subscription_tier ?? '').toUpperCase() || '—';

export const managerName = (r: SuperAdminRestaurant) => r.manager?.full_name || 'No manager yet';

export const placeOf = (r: SuperAdminRestaurant) => [r.business_address, r.city].filter(Boolean).join(', ') || 'No address yet';
