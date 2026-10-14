import { createContext, useContext, useState, type ReactNode } from 'react';

// Demo data copied from the "Bara SUPER ADMIN — Mobile app" Figma frames.

export const ownerLine = 'Derrick · Platform owner · 08 Oct 2026';

export type Plan = 'BASIC' | 'PRO' | 'PREMIUM';
export type Status = 'Active' | 'Grace' | 'Restricted' | 'Locked' | 'Archived';

const features = ['POS + Inventory/Stock tracking', 'Sales Reports + Monthly Consumables', 'AI Data Analysis'];
// BASIC is not shown in Figma; it is assumed to include POS + inventory only.
const included: Record<Plan, number> = { BASIC: 1, PRO: 2, PREMIUM: 3 };
export const planFeatures = (plan: Plan) => features.map((label, i) => ({ label, included: i < included[plan] }));

export type Restaurant = {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  email: string;
  phone: string;
  plan: Plan;
  paidThrough: string;
  lastSync: string;
  syncNote: string;
  status: Status;
  invitation: string;
  operations?: { synced: string; flags: string };
};

export type RequestKind = 'New restaurant' | 'Manager access' | 'Plan change';

export type Payment = {
  reference: string;
  amount: number;
  method: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  note: string;
};

export type Request = {
  id: string;
  kind: RequestKind;
  submitted: string;
  restaurant: string;
  restaurantId?: string;
  location: string;
  venueContact?: string;
  manager: string;
  email: string;
  phone: string;
  summary: string;
  checks: string;
  plan: Plan;
  period?: { start: string; end: string };
  payment?: Payment;
  status: 'Pending' | 'Completed';
  outcome?: string;
};

export type SupportMessage = { from: string; time: string; text: string };

export type SupportSession = {
  id: string;
  ticket: string;
  restaurantId: string;
  authorizedBy: string;
  window: string;
  topic: string;
  messages: SupportMessage[];
  summary: string;
  resolved: boolean;
};

export type TenantPayment = Payment & { tenantId: string; applied: boolean };

const initialRestaurants: Restaurant[] = [
  {
    id: 'rw-402',
    name: 'Kigali Heights',
    code: 'RW-402',
    location: 'Kimihurura, Kigali',
    manager: 'Aline Mukamana',
    email: 'aline@kigaliheights.rw',
    phone: '+250 788 402 100',
    plan: 'PREMIUM',
    paidThrough: '31 Oct 2026',
    lastSync: '09:38',
    syncNote: 'Current',
    status: 'Active',
    invitation: 'Invitation accepted',
    operations: {
      synced: 'Synced 09:38 · POS and stock healthy',
      flags: 'Oil usage +31% vs baseline · 7 evening voids vs 2 last week. Flags need manager review.',
    },
  },
  {
    id: 'rw-418',
    name: 'Nyamirambo Kitchen',
    code: 'RW-418',
    location: 'Nyamirambo, Kigali',
    manager: 'Eric Niyonzima',
    email: 'eric@nyamirambokitchen.rw',
    phone: '+250 788 418 100',
    plan: 'PRO',
    paidThrough: '04 Oct 2026',
    lastSync: '09:34',
    syncNote: '4 days',
    status: 'Grace',
    invitation: 'Invitation accepted',
  },
  {
    id: 'rw-426',
    name: 'Kivu Table',
    code: 'RW-426',
    location: 'Rubavu',
    manager: 'Diane Uwase',
    email: 'diane@kivutable.rw',
    phone: '+250 788 426 100',
    plan: 'BASIC',
    paidThrough: '28 Sep 2026',
    lastSync: '09:20',
    syncNote: '10 days',
    status: 'Restricted',
    invitation: 'Invitation accepted',
  },
  {
    id: 'rw-431',
    name: 'Huye Garden',
    code: 'RW-431',
    location: 'Huye',
    manager: 'Patrick Mugabo',
    email: 'patrick@huyegarden.rw',
    phone: '+250 788 431 100',
    plan: 'PRO',
    paidThrough: '18 Sep 2026',
    lastSync: '18 Sep',
    syncNote: '20 days',
    status: 'Locked',
    invitation: 'Invitation accepted',
  },
  {
    id: 'rw-439',
    name: 'Musanze Corner',
    code: 'RW-439',
    location: 'Musanze',
    manager: 'Chantal Uwera',
    email: 'chantal@musanzecorner.rw',
    phone: '+250 788 439 100',
    plan: 'BASIC',
    paidThrough: '30 Jul 2026',
    lastSync: '30 Jul',
    syncNote: '70 days',
    status: 'Archived',
    invitation: 'Invitation accepted',
  },
  {
    id: 'rw-445',
    name: 'Remera Social',
    code: 'RW-445',
    location: 'Remera, Kigali',
    manager: 'Jean Habimana',
    email: 'jean@remerasocial.rw',
    phone: '+250 788 445 100',
    plan: 'PRO',
    paidThrough: '25 Oct 2026',
    lastSync: '09:36',
    syncNote: 'Current',
    status: 'Active',
    invitation: 'Invitation pending',
  },
];

const initialRequests: Request[] = [
  {
    id: 'REQ-108',
    kind: 'New restaurant',
    submitted: '08 Oct · 08:45',
    restaurant: 'Umucyo Bistro',
    location: 'Kacyiru, Kigali',
    venueContact: 'hello@umucyo.rw · +250 788 108 200',
    manager: 'Claudine Ingabire',
    email: 'claudine@umucyo.rw',
    phone: '+250 788 108 201',
    summary: 'PRO requested · Payment verified',
    checks: 'Contact confirmed · No duplicate account',
    plan: 'PRO',
    period: { start: '08 Oct 2026', end: '07 Nov 2026' },
    payment: {
      reference: 'MM-804108',
      amount: 45000,
      method: 'MTN Mobile Money · Demo transaction',
      verified: true,
      verifiedBy: 'Derrick',
      verifiedAt: '09:20',
      note: 'Receipt and ledger matched · No duplicate reference',
    },
    status: 'Pending',
  },
  {
    id: 'REQ-107',
    kind: 'Manager access',
    submitted: '07 Oct · 16:20',
    restaurant: 'Remera Social',
    restaurantId: 'rw-445',
    location: 'Remera, Kigali',
    manager: 'Jean Habimana',
    email: 'jean@remerasocial.rw',
    phone: '+250 788 445 100',
    summary: 'Resend manager invitation',
    checks: 'Existing tenant · Manager email unchanged',
    plan: 'PRO',
    status: 'Pending',
  },
  {
    id: 'REQ-106',
    kind: 'Plan change',
    submitted: '07 Oct · 11:05',
    restaurant: 'Kivu Table',
    restaurantId: 'rw-426',
    location: 'Rubavu',
    manager: 'Diane Uwase',
    email: 'diane@kivutable.rw',
    phone: '+250 788 426 100',
    summary: 'BASIC → PRO · Payment not verified',
    checks: 'Existing tenant · Upgrade from BASIC',
    plan: 'PRO',
    period: { start: '08 Oct 2026', end: '07 Nov 2026' },
    payment: {
      reference: 'MM-803960',
      amount: 45000,
      method: 'MTN Mobile Money · Demo transaction',
      verified: false,
      note: 'Receipt uploaded · Not found in ledger yet',
    },
    status: 'Pending',
  },
  {
    id: 'REQ-105',
    kind: 'Manager access',
    submitted: '06 Oct · 10:10',
    restaurant: 'Kigali Heights',
    restaurantId: 'rw-402',
    location: 'Kimihurura, Kigali',
    manager: 'Aline Mukamana',
    email: 'aline@kigaliheights.rw',
    phone: '+250 788 402 100',
    summary: 'Support access',
    checks: '',
    plan: 'PREMIUM',
    status: 'Completed',
    outcome: 'Kigali Heights: support authorized',
  },
  {
    id: 'REQ-104',
    kind: 'Plan change',
    submitted: '05 Oct · 15:40',
    restaurant: 'Huye Garden',
    restaurantId: 'rw-431',
    location: 'Huye',
    manager: 'Patrick Mugabo',
    email: 'patrick@huyegarden.rw',
    phone: '+250 788 431 100',
    summary: 'Duplicate payment',
    checks: '',
    plan: 'PRO',
    status: 'Completed',
    outcome: 'Huye Garden: duplicate payment rejected; reason sent.',
  },
];

const initialPayments: TenantPayment[] = [
  {
    tenantId: 'rw-418',
    reference: 'MM-804219',
    amount: 45000,
    method: 'MTN Mobile Money · 08 Oct, 09:25',
    verified: true,
    verifiedBy: 'Derrick',
    verifiedAt: '09:25',
    note: 'Reference, payer and amount matched by Derrick',
    applied: false,
  },
];

const initialSession: SupportSession = {
  id: 'SS-024',
  ticket: 'SUP-24',
  restaurantId: 'rw-402',
  authorizedBy: 'Aline',
  window: '09:30–10:00',
  topic: 'Cooking oil stock discrepancy',
  messages: [
    { from: 'Aline Mukamana', time: '09:12', text: '“Oil usage looks too high compared with sales. Can you help check the movements?”' },
    { from: 'Derrick', time: '09:32', text: 'I’m reviewing synced summaries in read-only mode. No stock or financial records will be changed.' },
  ],
  summary:
    'Synced 09:38 · POS + inventory healthy Oil usage +31% vs prior 7-day baseline 7 evening voids vs 2 in the prior week',
  resolved: false,
};

type Store = {
  restaurants: Restaurant[];
  requests: Request[];
  payments: TenantPayment[];
  session: SupportSession;
  lastActivity: string;
  approveRequest: (id: string, reason: string) => Restaurant | undefined;
  rejectRequest: (id: string, reason: string) => void;
  createFromRequest: (id: string, edits: { name: string; location: string; manager: string; email: string }) => Restaurant;
  setStatus: (id: string, status: Status, reason: string) => void;
  applyPayment: (tenantId: string, plan: Plan, through: string) => void;
  sendGuidance: (text: string) => void;
  resolveSession: () => void;
};

const StoreContext = createContext<Store | null>(null);

const time = () => new Date().toTimeString().slice(0, 5);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [requests, setRequests] = useState(initialRequests);
  const [payments, setPayments] = useState(initialPayments);
  const [session, setSession] = useState(initialSession);
  const [lastActivity, setLastActivity] = useState('MM-804219 verified at 09:25');

  const complete = (id: string, outcome: string) =>
    setRequests((list) => list.map((r) => (r.id === id ? { ...r, status: 'Completed', outcome } : r)));

  const addTenant = (q: Request, edits?: { name: string; location: string; manager: string; email: string }) => {
    const created: Restaurant = {
      id: `rw-${q.id.slice(4)}`,
      name: edits?.name ?? q.restaurant,
      code: `RW-${q.id.slice(4)}`,
      location: edits?.location ?? q.location,
      manager: edits?.manager ?? q.manager,
      email: edits?.email ?? q.email,
      phone: q.phone,
      plan: q.plan,
      paidThrough: q.period?.end ?? '—',
      lastSync: '—',
      syncNote: 'Not synced yet',
      status: 'Active',
      invitation: 'Invitation sent · Expires in 72 hours',
    };
    setRestaurants((list) => [created, ...list.filter((r) => r.id !== created.id)]);
    return created;
  };

  const store: Store = {
    restaurants,
    requests,
    payments,
    session,
    lastActivity,
    approveRequest: (id) => {
      const q = requests.find((r) => r.id === id);
      if (!q) return;
      let created: Restaurant | undefined;
      if (q.kind === 'New restaurant') {
        created = addTenant(q);
        complete(id, `${q.restaurant}: approved, ${q.plan} applied, invitation sent`);
      } else if (q.kind === 'Plan change') {
        setRestaurants((list) =>
          list.map((r) => (r.id === q.restaurantId ? { ...r, plan: q.plan, status: 'Active', paidThrough: q.period?.end ?? r.paidThrough } : r)),
        );
        complete(id, `${q.restaurant}: ${q.summary.split(' · ')[0]} approved`);
      } else {
        setRestaurants((list) => list.map((r) => (r.id === q.restaurantId ? { ...r, invitation: 'Invitation re-sent · Expires in 72 hours' } : r)));
        complete(id, `${q.restaurant}: manager invitation re-sent`);
      }
      setLastActivity(`${id} approved at ${time()}`);
      return created;
    },
    rejectRequest: (id, reason) => {
      const q = requests.find((r) => r.id === id);
      complete(id, `${q?.restaurant}: rejected; reason sent (${reason})`);
      setLastActivity(`${id} rejected at ${time()}`);
    },
    createFromRequest: (id, edits) => {
      const q = requests.find((r) => r.id === id)!;
      const created = addTenant(q, edits);
      complete(id, `${created.name}: created, invitation sent`);
      setLastActivity(`${created.name} created at ${time()}`);
      return created;
    },
    setStatus: (id, status) => {
      setRestaurants((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
      setLastActivity(`${restaurants.find((r) => r.id === id)?.name} set to ${status} at ${time()}`);
    },
    applyPayment: (tenantId, plan, through) => {
      setRestaurants((list) => list.map((r) => (r.id === tenantId ? { ...r, status: 'Active', plan, paidThrough: through } : r)));
      setPayments((list) => list.map((p) => (p.tenantId === tenantId ? { ...p, applied: true } : p)));
      setLastActivity(`Payment applied at ${time()}`);
    },
    sendGuidance: (text) =>
      setSession((x) => ({ ...x, messages: [...x.messages, { from: 'Derrick', time: time(), text }] })),
    resolveSession: () => {
      setSession((x) => ({ ...x, resolved: true }));
      setLastActivity(`${session.ticket} resolved at ${time()}`);
    },
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const st = useContext(StoreContext);
  if (!st) throw new Error('useStore must be used inside StoreProvider');
  return st;
}

export const statusTone = { Active: 'green', Grace: 'yellow', Restricted: 'red', Locked: 'red', Archived: 'red' } as const;
export const rwf = (n: number) => `RWF ${n.toLocaleString('en-US')}`;
export const firstName = (full: string) => full.split(' ')[0];
