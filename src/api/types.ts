// Shapes from the Bara API schema (`/api/schema/`).

export type RestaurantRef = { id: string; name: string; code: string };

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  restaurant: RestaurantRef | null;
};

export type LoginResponse = { message: string; access: string; refresh: string; user: User };

export type MessageResponse = { message: string };

export type Tier = 'basic' | 'pro' | 'premium';

export type PaymentStatus = 'pending' | 'paid' | 'rejected';

export type PaymentConfirmation = {
  id: string;
  subscription: string;
  payer_name: string;
  payer_phone: string;
  submitted_at: string;
  status: PaymentStatus;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string;
  // Not in the schema yet; shown when the backend includes them.
  restaurant_name?: string;
  tier?: Tier;
  amount?: number;
};

export type SubscriptionPlan = {
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
};
