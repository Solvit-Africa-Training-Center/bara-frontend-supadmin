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

export type AccountStatus = 'pending_payment' | 'active' | 'grace' | 'restricted' | 'locked' | 'archived';

export type SuperAdminRestaurant = {
  id: string;
  name: string;
  code: string;
  phone: string;
  city: string;
  business_address: string;
  subscription_tier: Tier;
  account_status: AccountStatus;
  setup_completed: boolean;
  created_at: string;
  /** The schema says string, but the backend sends the manager object (or null when there is none). */
  manager: RestaurantManager | null;
};

export type RestaurantManager = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone_number: string;
  is_active: boolean;
};

export type SuperAdminManager = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_code: string;
};
