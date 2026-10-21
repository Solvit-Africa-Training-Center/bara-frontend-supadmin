import { api } from '@/api/client';
import type {
  OnboardingRequest,
  PaymentConfirmation,
  RestaurantCreateInput,
  SubscriptionPlan,
  SuperAdminManager,
  SuperAdminRestaurant,
} from '@/api/types';

// Super Admin endpoints of the Bara API.

export const listPayments = () => api.get<PaymentConfirmation[]>('/restaurant/payment-confirmations/');

/** Approves the payment and activates its subscription for the given period. */
export const approvePayment = (id: string, startsAt: Date, endsAt: Date) =>
  api.post<PaymentConfirmation>(`/restaurant/payment-confirmations/${id}/approve/`, {
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  });

export const rejectPayment = (id: string, reason: string) =>
  api.post<PaymentConfirmation>(`/restaurant/payment-confirmations/${id}/reject/`, { rejection_reason: reason });

export const listPlans = () => api.get<SubscriptionPlan[]>('/restaurant/subscription-plans/');

export const listRestaurants = () => api.get<SuperAdminRestaurant[]>('/super-admin/restaurants/');
export const getRestaurant = (id: string) => api.get<SuperAdminRestaurant>(`/super-admin/restaurants/${encodeURIComponent(id)}/`);

export const createRestaurant = (restaurant: RestaurantCreateInput) =>
  api.post<SuperAdminRestaurant>('/super-admin/restaurants/', restaurant);

export const listOnboardingRequests = () => api.get<OnboardingRequest[]>('/restaurant/onboarding-requests/');

export type RestaurantAction = 'restrict' | 'lock' | 'reactivate' | 'extend-grace';

/** Changes the restaurant's account status; the backend returns the updated restaurant. */
export const changeRestaurantStatus = (id: string, action: RestaurantAction, reason: string) =>
  api.post<SuperAdminRestaurant>(`/super-admin/restaurants/${id}/${action}/`, { reason });

/** Managers whose restaurant name, code or own details match `search`. */
export const listManagers = (search: string) =>
  api.get<SuperAdminManager[]>(`/super-admin/managers/?search=${encodeURIComponent(search)}`);

export const getManager = (id: string) => api.get<SuperAdminManager>(`/super-admin/managers/${encodeURIComponent(id)}/`);

export const getOnboardingRequest = (id: string) =>
  api.get<OnboardingRequest>(`/restaurant/onboarding-requests/${encodeURIComponent(id)}/`);

export const cancelOnboardingRequest = (id: string) =>
  api.post<OnboardingRequest>(`/restaurant/onboarding-requests/${encodeURIComponent(id)}/cancel/`, {});
