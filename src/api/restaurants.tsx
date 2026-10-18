import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { changeRestaurantStatus, listRestaurants, type RestaurantAction } from '@/api/admin';
import type { AccountStatus, SuperAdminRestaurant } from '@/api/types';
import type { Tone } from '@/components/ui';

export const mockSuperAdminRestaurants: SuperAdminRestaurant[] = [
  {
    id: 'rw-402',
    name: 'Kigali Heights',
    code: 'RW-402',
    phone: '+250 788 402 100',
    city: 'Kigali',
    business_address: 'Kimihurura, Kigali',
    subscription_tier: 'premium',
    account_status: 'active',
    setup_completed: true,
    created_at: '2026-05-12T08:00:00Z',
    manager: {
      id: 'mgr-402',
      first_name: 'Aline',
      last_name: 'Mukamana',
      full_name: 'Aline Mukamana',
      email: 'aline@kigaliheights.rw',
      phone_number: '+250 788 402 100',
      is_active: true,
    },
  },
  {
    id: 'rw-418',
    name: 'Nyamirambo Kitchen',
    code: 'RW-418',
    phone: '+250 788 418 100',
    city: 'Kigali',
    business_address: 'Nyamirambo, Kigali',
    subscription_tier: 'pro',
    account_status: 'grace',
    setup_completed: true,
    created_at: '2026-06-18T08:00:00Z',
    manager: {
      id: 'mgr-418',
      first_name: 'Eric',
      last_name: 'Niyonzima',
      full_name: 'Eric Niyonzima',
      email: 'eric@nyamirambokitchen.rw',
      phone_number: '+250 788 418 100',
      is_active: true,
    },
  },
  {
    id: 'rw-426',
    name: 'Kivu Table',
    code: 'RW-426',
    phone: '+250 788 426 100',
    city: 'Rubavu',
    business_address: 'Rubavu',
    subscription_tier: 'basic',
    account_status: 'restricted',
    setup_completed: true,
    created_at: '2026-07-01T08:00:00Z',
    manager: {
      id: 'mgr-426',
      first_name: 'Diane',
      last_name: 'Uwase',
      full_name: 'Diane Uwase',
      email: 'diane@kivutable.rw',
      phone_number: '+250 788 426 100',
      is_active: true,
    },
  },
  {
    id: 'rw-431',
    name: 'Huye Garden',
    code: 'RW-431',
    phone: '+250 788 431 100',
    city: 'Huye',
    business_address: 'Huye',
    subscription_tier: 'pro',
    account_status: 'locked',
    setup_completed: true,
    created_at: '2026-07-15T08:00:00Z',
    manager: {
      id: 'mgr-431',
      first_name: 'Patrick',
      last_name: 'Mugabo',
      full_name: 'Patrick Mugabo',
      email: 'patrick@huyegarden.rw',
      phone_number: '+250 788 431 100',
      is_active: true,
    },
  },
  {
    id: 'rw-439',
    name: 'Musanze Corner',
    code: 'RW-439',
    phone: '+250 788 439 100',
    city: 'Musanze',
    business_address: 'Musanze',
    subscription_tier: 'basic',
    account_status: 'archived',
    setup_completed: true,
    created_at: '2026-08-01T08:00:00Z',
    manager: {
      id: 'mgr-439',
      first_name: 'Chantal',
      last_name: 'Uwera',
      full_name: 'Chantal Uwera',
      email: 'chantal@musanzecorner.rw',
      phone_number: '+250 788 439 100',
      is_active: true,
    },
  },
  {
    id: 'rw-445',
    name: 'Remera Social',
    code: 'RW-445',
    phone: '+250 788 445 100',
    city: 'Kigali',
    business_address: 'Remera, Kigali',
    subscription_tier: 'pro',
    account_status: 'active',
    setup_completed: false,
    created_at: '2026-09-10T08:00:00Z',
    manager: {
      id: 'mgr-445',
      first_name: 'Jean',
      last_name: 'Habimana',
      full_name: 'Jean Habimana',
      email: 'jean@remerasocial.rw',
      phone_number: '+250 788 445 100',
      is_active: false,
    },
  },
];

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
          if (list && list.length > 0) {
            setRestaurants([...list].sort((a, b) => a.name.localeCompare(b.name)));
          } else {
            setRestaurants(mockSuperAdminRestaurants);
          }
          setError(null);
        })
        .catch(() => {
          // Dev bypass / server offline fallback: use Figma sample restaurants
          setRestaurants(mockSuperAdminRestaurants);
          setError(null);
        })
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
    try {
      const updated = await changeRestaurantStatus(id, action, reason);
      setRestaurants((list) => list.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      return updated;
    } catch {
      // Local dev fallback if API is unavailable or dev session
      const targetStatus: AccountStatus =
        action === 'restrict'
          ? 'restricted'
          : action === 'lock'
            ? 'locked'
            : action === 'extend-grace'
              ? 'grace'
              : 'active';
      let result: SuperAdminRestaurant | undefined;
      setRestaurants((list) =>
        list.map((r) => {
          if (r.id === id) {
            result = { ...r, account_status: targetStatus };
            return result;
          }
          return r;
        }),
      );
      if (result) return result;
      throw new Error('Restaurant not found');
    }
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
