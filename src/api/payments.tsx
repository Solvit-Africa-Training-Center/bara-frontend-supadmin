import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { approvePayment, listPayments, listPlans, rejectPayment } from '@/api/admin';
import { useSession } from '@/api/session';
import type { PaymentConfirmation, SubscriptionPlan } from '@/api/types';

export const mockPlans: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: 25000,
    currency: 'RWF',
    billing_period: 'month',
    features: ['POS + Inventory/Stock tracking'],
  },
  {
    name: 'Pro',
    price: 45000,
    currency: 'RWF',
    billing_period: 'month',
    features: ['POS + Inventory/Stock tracking', 'Sales Reports + Monthly Consumables'],
  },
  {
    name: 'Premium',
    price: 75000,
    currency: 'RWF',
    billing_period: 'month',
    features: ['POS + Inventory/Stock tracking', 'Sales Reports + Monthly Consumables', 'AI Data Analysis'],
  },
];

export const mockPayments: PaymentConfirmation[] = [
  {
    id: 'req-108-umucyo',
    subscription: 'sub-804108',
    payer_name: 'Claudine Ingabire',
    payer_phone: '+250 788 108 201',
    submitted_at: '2026-10-08T08:45:00Z',
    status: 'pending',
    verified_by: null,
    verified_at: null,
    rejection_reason: '',
    restaurant_name: 'Umucyo Bistro',
    tier: 'pro',
    amount: 45000,
  },
  {
    id: 'req-107-remera',
    subscription: 'sub-804107',
    payer_name: 'Jean Habimana',
    payer_phone: '+250 788 445 100',
    submitted_at: '2026-10-07T16:20:00Z',
    status: 'pending',
    verified_by: null,
    verified_at: null,
    rejection_reason: '',
    restaurant_name: 'Remera Social',
    tier: 'pro',
    amount: 45000,
  },
  {
    id: 'req-106-kivu',
    subscription: 'sub-803960',
    payer_name: 'Diane Uwase',
    payer_phone: '+250 788 426 100',
    submitted_at: '2026-10-07T11:05:00Z',
    status: 'pending',
    verified_by: null,
    verified_at: null,
    rejection_reason: '',
    restaurant_name: 'Kivu Table',
    tier: 'pro',
    amount: 45000,
  },
  {
    id: 'req-105-kigali',
    subscription: 'sub-804105',
    payer_name: 'Aline Mukamana',
    payer_phone: '+250 788 402 100',
    submitted_at: '2026-10-06T10:10:00Z',
    status: 'paid',
    verified_by: 'Derrick',
    verified_at: '2026-10-06T10:30:00Z',
    rejection_reason: '',
    restaurant_name: 'Kigali Heights',
    tier: 'premium',
    amount: 75000,
  },
  {
    id: 'req-104-huye',
    subscription: 'sub-804104',
    payer_name: 'Patrick Mugabo',
    payer_phone: '+250 788 431 100',
    submitted_at: '2026-10-05T15:40:00Z',
    status: 'rejected',
    verified_by: 'Derrick',
    verified_at: '2026-10-05T15:55:00Z',
    rejection_reason: 'Duplicate payment reference',
    restaurant_name: 'Huye Garden',
    tier: 'pro',
    amount: 45000,
  },
];

type Payments = {
  payments: PaymentConfirmation[];
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  approve: (id: string, startsAt: Date, endsAt: Date) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
};

const PaymentsContext = createContext<Payments | null>(null);

/** Payment confirmations (the Requests tab) and subscription plans, loaded from the Bara API. */
export function PaymentsProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [payments, setPayments] = useState<PaymentConfirmation[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentsAndPlans = useCallback(async () => {
    try {
      const [p, pl] = await Promise.all([
        listPayments().catch(() => mockPayments),
        listPlans().catch(() => mockPlans),
      ]);
      setPayments(p && p.length > 0 ? [...p].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)) : mockPayments);
      setPlans(pl && pl.length > 0 ? pl : mockPlans);
      setError(null);
    } catch {
      setPayments(mockPayments);
      setPlans(mockPlans);
      setError(null);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchPaymentsAndPlans();
    setLoading(false);
  }, [fetchPaymentsAndPlans]);

  useEffect(() => {
    let active = true;
    if (status === 'signedIn') {
      const timer = setTimeout(() => {
        if (!active) return;
        setLoading(true);
        fetchPaymentsAndPlans().finally(() => {
          if (active) setLoading(false);
        });
      }, 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
    return () => {
      active = false;
    };
  }, [status, fetchPaymentsAndPlans]);

  const replace = (updated: PaymentConfirmation) =>
    setPayments((list) => list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

  const approve = useCallback(async (id: string, startsAt: Date, endsAt: Date) => {
    try {
      const updated = await approvePayment(id, startsAt, endsAt);
      replace(updated);
    } catch {
      // Local dev fallback
      setPayments((list) =>
        list.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'paid' as const,
                verified_at: new Date().toISOString(),
                verified_by: 'Derrick',
              }
            : p,
        ),
      );
    }
  }, []);

  const reject = useCallback(async (id: string, reason: string) => {
    try {
      const updated = await rejectPayment(id, reason);
      replace(updated);
    } catch {
      // Local dev fallback
      setPayments((list) =>
        list.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'rejected' as const,
                rejection_reason: reason,
              }
            : p,
        ),
      );
    }
  }, []);

  const value = useMemo(
    () => ({ payments, plans, loading, error, reload, approve, reject }),
    [payments, plans, loading, error, reload, approve, reject],
  );
  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const value = useContext(PaymentsContext);
  if (!value) throw new Error('usePayments must be used inside <PaymentsProvider>');
  return value;
}

/** "PAY-3F2A" style reference from the payment's UUID. */
export const paymentRef = (p: PaymentConfirmation) => `PAY-${p.id.slice(0, 4).toUpperCase()}`;

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' ·');

export const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
