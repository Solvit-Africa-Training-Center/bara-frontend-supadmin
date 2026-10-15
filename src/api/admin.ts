import { api } from '@/api/client';
import type { PaymentConfirmation, SubscriptionPlan } from '@/api/types';

// Super Admin endpoints of the Bara API.

export const listPayments = () => api.get<PaymentConfirmation[]>('/payment-confirmations/');

/** Approves the payment and activates its subscription for the given period. */
export const approvePayment = (id: string, startsAt: Date, endsAt: Date) =>
  api.post<PaymentConfirmation>(`/payment-confirmations/${id}/approve/`, {
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  });

export const rejectPayment = (id: string, reason: string) =>
  api.post<PaymentConfirmation>(`/payment-confirmations/${id}/reject/`, { rejection_reason: reason });

export const listPlans = () => api.get<SubscriptionPlan[]>('/subscription-plans/');
