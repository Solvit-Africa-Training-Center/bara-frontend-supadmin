import { createContext, useContext, useState, type ReactNode } from 'react';

export type RestaurantStatus = 'active' | 'pending' | 'suspended';

export type Restaurant = {
  id: string;
  name: string;
  code: string;
  district: string;
  address: string;
  plan: 'Starter' | 'Standard' | 'Premium';
  status: RestaurantStatus;
  manager: { name: string; phone: string; email: string };
  todaySales: number;
  ordersToday: number;
  staff: number;
  lastSync: string;
  joined: string;
};

export type RequestItem = {
  id: string;
  restaurantId: string;
  title: string;
  detail: string;
  kind: 'access' | 'support' | 'billing';
  createdAt: string;
  resolved: boolean;
};

export type Activity = { id: string; text: string; time: string };

const initialRestaurants: Restaurant[] = [
  {
    id: 'rw-402',
    name: 'Kigali Heights Bistro',
    code: 'RW-402',
    district: 'Gasabo',
    address: 'Kigali Heights, KG 7 Ave',
    plan: 'Premium',
    status: 'active',
    manager: { name: 'Jean-Paul Mugisha', phone: '+250 788 123 456', email: 'jp@kigaliheights.rw' },
    todaySales: 1485000,
    ordersToday: 142,
    staff: 12,
    lastSync: '2 min ago',
    joined: '12 Jan 2026',
  },
  {
    id: 'rw-318',
    name: 'Nyamirambo Kitchen',
    code: 'RW-318',
    district: 'Nyarugenge',
    address: 'KN 2 St, Nyamirambo',
    plan: 'Standard',
    status: 'active',
    manager: { name: 'Aline Uwase', phone: '+250 783 456 789', email: 'aline@nyakitchen.rw' },
    todaySales: 642000,
    ordersToday: 77,
    staff: 7,
    lastSync: '5 min ago',
    joined: '3 Mar 2026',
  },
  {
    id: 'rw-511',
    name: 'Lake Kivu Grill',
    code: 'RW-511',
    district: 'Rubavu',
    address: 'Gisenyi beach road',
    plan: 'Standard',
    status: 'pending',
    manager: { name: 'Eric Habimana', phone: '+250 722 987 654', email: 'eric@kivugrill.rw' },
    todaySales: 0,
    ordersToday: 0,
    staff: 4,
    lastSync: 'Never',
    joined: '10 Oct 2026',
  },
  {
    id: 'rw-207',
    name: 'Huye Coffee House',
    code: 'RW-207',
    district: 'Huye',
    address: 'University Ave, Butare',
    plan: 'Starter',
    status: 'suspended',
    manager: { name: 'Claudine Mukamana', phone: '+250 785 222 333', email: 'claudine@huyecoffee.rw' },
    todaySales: 0,
    ordersToday: 0,
    staff: 3,
    lastSync: '9 days ago',
    joined: '21 May 2026',
  },
  {
    id: 'rw-433',
    name: 'Kimironko Market Eats',
    code: 'RW-433',
    district: 'Gasabo',
    address: 'Kimironko Market, KG 11 Ave',
    plan: 'Starter',
    status: 'active',
    manager: { name: 'Patrick Niyonzima', phone: '+250 789 111 000', email: 'patrick@kmeats.rw' },
    todaySales: 318500,
    ordersToday: 54,
    staff: 5,
    lastSync: '1 min ago',
    joined: '8 Aug 2026',
  },
];

const initialRequests: RequestItem[] = [
  {
    id: 'q1',
    restaurantId: 'rw-511',
    title: 'Approve new restaurant',
    detail: 'Lake Kivu Grill submitted documents and is waiting for activation.',
    kind: 'access',
    createdAt: 'Today, 09:12',
    resolved: false,
  },
  {
    id: 'q2',
    restaurantId: 'rw-402',
    title: 'Reset manager PIN',
    detail: 'Jean-Paul is locked out after 5 wrong PIN attempts.',
    kind: 'access',
    createdAt: 'Today, 08:40',
    resolved: false,
  },
  {
    id: 'q3',
    restaurantId: 'rw-207',
    title: 'Overdue subscription',
    detail: 'Starter plan payment is 9 days overdue. Account was suspended automatically.',
    kind: 'billing',
    createdAt: 'Yesterday',
    resolved: false,
  },
  {
    id: 'q4',
    restaurantId: 'rw-318',
    title: 'Receipt printer not syncing',
    detail: 'Offline orders printed but not uploaded since 07:00.',
    kind: 'support',
    createdAt: 'Yesterday',
    resolved: true,
  },
];

const initialActivity: Activity[] = [
  { id: 'a1', text: 'Lake Kivu Grill registered and is awaiting approval', time: '09:12' },
  { id: 'a2', text: 'Kigali Heights Bistro synced 142 orders', time: '08:55' },
  { id: 'a3', text: 'Huye Coffee House was suspended (billing)', time: 'Yesterday' },
];

type Store = {
  restaurants: Restaurant[];
  requests: RequestItem[];
  activity: Activity[];
  addRestaurant: (r: Omit<Restaurant, 'id' | 'todaySales' | 'ordersToday' | 'lastSync' | 'joined' | 'status'>) => Restaurant;
  setStatus: (id: string, status: RestaurantStatus) => void;
  resolveRequest: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [requests, setRequests] = useState(initialRequests);
  const [activity, setActivity] = useState(initialActivity);

  const log = (text: string) =>
    setActivity((a) => [{ id: String(Date.now()), text, time: 'Just now' }, ...a]);

  const store: Store = {
    restaurants,
    requests,
    activity,
    addRestaurant: (r) => {
      const created: Restaurant = {
        ...r,
        id: r.code.toLowerCase(),
        status: 'pending',
        todaySales: 0,
        ordersToday: 0,
        lastSync: 'Never',
        joined: 'Today',
      };
      setRestaurants((list) => [created, ...list]);
      log(`${created.name} added. Invite sent to ${created.manager.name}`);
      return created;
    },
    setStatus: (id, status) => {
      setRestaurants((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
      const name = restaurants.find((x) => x.id === id)?.name ?? 'Restaurant';
      log(`${name} is now ${status}`);
    },
    resolveRequest: (id) =>
      setRequests((list) => list.map((x) => (x.id === id ? { ...x, resolved: true } : x))),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

export const formatRwf = (n: number) => `${n.toLocaleString('en-US')} RWF`;
