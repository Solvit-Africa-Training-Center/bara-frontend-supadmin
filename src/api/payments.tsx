import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { approvePayment, listPayments, listPlans, rejectPayment } from '@/api/admin';
import { errorMessage } from '@/api/client';
import { useSession } from '@/api/session';
import type { PaymentConfirmation, SubscriptionPlan } from '@/api/types';

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

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, pl] = await Promise.all([listPayments(), listPlans().catch(() => [] as SubscriptionPlan[])]);
      setPayments([...p].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)));
      setPlans(pl);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'signedIn') reload();
    else {
      setPayments([]);
      setPlans([]);
    }
  }, [status, reload]);

  const replace = (updated: PaymentConfirmation) => setPayments((list) => list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

  const approve = useCallback(async (id: string, startsAt: Date, endsAt: Date) => replace(await approvePayment(id, startsAt, endsAt)), []);
  const reject = useCallback(async (id: string, reason: string) => replace(await rejectPayment(id, reason)), []);

  const value = useMemo(() => ({ payments, plans, loading, error, reload, approve, reject }), [payments, plans, loading, error, reload, approve, reject]);
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
