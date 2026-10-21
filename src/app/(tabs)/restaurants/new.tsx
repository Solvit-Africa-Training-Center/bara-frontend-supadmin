import { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { listOnboardingRequests } from '@/api/admin';
import { errorMessage } from '@/api/client';
import { usePayments } from '@/api/payments';
import { useRestaurants } from '@/api/restaurants';
import type { OnboardingRequest, Tier } from '@/api/types';
import { AdminScreen, Btn, Card, confirm, Gap, H, Input, Label, LoadState, notify, PlanFeatures, Select, T } from '@/components/ui';

const requestStatus = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export default function AddRestaurant() {
  const { createRestaurant } = useRestaurants();
  const { plans, loading: loadingPlans, error: planError, reload: reloadPlans } = usePayments();
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<Tier>('basic');
  const [saving, setSaving] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      setRequests(await listOnboardingRequests());
      setRequestError(null);
    } catch (error) {
      setRequestError(errorMessage(error));
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  const selectedPlan = plans.find((plan) => plan.tier === tier) ?? plans[0];

  const submit = () => {
    const restaurantName = name.trim();
    const restaurantCode = code.trim().toUpperCase();
    const restaurantCity = city.trim();
    const businessAddress = address.trim();
    if (!restaurantName) return notify('Restaurant name required', 'Enter the restaurant name.');
    if (!/^[A-Z0-9-]+$/.test(restaurantCode)) {
      return notify('Invalid restaurant code', 'Use only letters, numbers, and hyphens for the short code.');
    }
    if (!restaurantCity) return notify('City required', 'Enter the restaurant city.');
    if (!businessAddress) return notify('Address required', 'Enter the business address.');
    if (!plans.length) return notify('Plans unavailable', 'Load the subscription plans before creating a restaurant.');

    confirm('Create restaurant?', `${restaurantName} will be created with the ${tier.toUpperCase()} tier. The API does not create a manager account or invitation.`, async () => {
      setSaving(true);
      try {
        const created = await createRestaurant({
          name: restaurantName,
          code: restaurantCode,
          phone: phone.trim(),
          city: restaurantCity,
          business_address: businessAddress,
          subscription_tier: tier,
        });
        notify('Restaurant created', `${created.name} was created. Manager setup is not provided by this API.`);
        router.replace({ pathname: '/restaurants/[id]', params: { id: created.id } });
      } catch (error) {
        notify('Could not create restaurant', errorMessage(error));
      } finally {
        setSaving(false);
      }
    }, 'Create');
  };

  const refresh = async () => {
    await Promise.all([loadRequests(), reloadPlans()]);
  };

  return (
    <AdminScreen title="Add restaurant" back="Restaurants" refreshing={loadingRequests || loadingPlans || saving} onRefresh={refresh}>
      <Card>
        <H>Restaurant details</H>
        <Label>Restaurant name</Label>
        <Input value={name} onChangeText={setName} placeholder="e.g. Nyamirambo Kitchen" />
        <Gap h={12} />
        <Label>Short code</Label>
        <Input value={code} onChangeText={setCode} placeholder="e.g. RW-448" autoCapitalize="characters" />
        <Gap h={12} />
        <Label>Phone</Label>
        <Input value={phone} onChangeText={setPhone} placeholder="+250..." keyboardType="phone-pad" />
        <Gap h={12} />
        <Label>City</Label>
        <Input value={city} onChangeText={setCity} placeholder="Kigali" />
        <Gap h={12} />
        <Label>Business address</Label>
        <Input value={address} onChangeText={setAddress} placeholder="District, street, or area" />
      </Card>

      <Card>
        <H>Subscription tier</H>
        <Select
          value={tier}
          options={plans.map((plan) => ({ value: plan.tier, label: `${plan.name} · ${plan.currency} ${plan.price.toLocaleString('en-US')} / ${plan.billing_period}` }))}
          onChange={setTier}
        />
        {selectedPlan ? <PlanFeatures plan={selectedPlan.name} features={selectedPlan.features} /> : null}
        <LoadState loading={loadingPlans && plans.length === 0} error={planError} onRetry={reloadPlans} />
      </Card>

      <ManagerSetupNote />
      <Btn label={saving ? 'Creating…' : 'Create restaurant'} variant="primary" disabled={saving || loadingPlans || !plans.length} onPress={submit} />

      <Card style={{ marginTop: 16 }}>
        <H>Onboarding requests</H>
        <T muted small style={{ marginBottom: 10 }}>Open a request to review its details or cancel it while it is still pending. Approval is not available here.</T>
        <LoadState loading={loadingRequests} error={requestError} onRetry={loadRequests} />
        {requests.map((request) => (
          <Pressable key={request.id} onPress={() => router.push({ pathname: '/restaurants/onboarding/[id]', params: { id: request.id } })}>
            <T style={{ marginBottom: 10 }} strong>{request.restaurant_name} · {requestStatus[request.status]}</T>
            <T muted small style={{ marginBottom: 12 }}>{request.fee.toLocaleString('en-US')} RWF · View request</T>
          </Pressable>
        ))}
        {!loadingRequests && !requestError && requests.length === 0 ? <T muted>No onboarding requests returned by the server.</T> : null}
      </Card>
    </AdminScreen>
  );
}

function ManagerSetupNote() {
  return (
    <Card muted>
      <H>Manager setup</H>
        <T>The API can create a restaurant record, but cannot create a manager account or send an invitation. Existing manager accounts can be reviewed from More → Managers.</T>
    </Card>
  );
}
