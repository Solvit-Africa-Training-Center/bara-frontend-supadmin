import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { cancelOnboardingRequest, getOnboardingRequest } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { OnboardingRequest } from '@/api/types';
import { AdminScreen, Btn, Card, confirm, H, LoadState, notify, Pill, T } from '@/components/ui';

const labels = { pending: 'Pending', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled' } as const;

export default function OnboardingRequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<OnboardingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try { setRequest(await getOnboardingRequest(id)); setError(null); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  const cancel = () => confirm('Cancel onboarding request?', `Cancel the request for ${request?.restaurant_name}? This cannot be undone.`, async () => {
    if (!id) return;
    setSaving(true);
    try { setRequest(await cancelOnboardingRequest(id)); notify('Request cancelled', 'The onboarding request was cancelled.'); }
    catch (e) { notify('Could not cancel request', errorMessage(e)); }
    finally { setSaving(false); }
  }, 'Cancel request');
  return (
    <AdminScreen title={request?.restaurant_name || 'Onboarding request'} back="Restaurants" refreshing={loading || saving} onRefresh={load}>
      <LoadState loading={loading} error={error} onRetry={load} />
      {request ? <Card>
        <H>Request details</H>
        <Pill label={labels[request.status]} tone={request.status === 'pending' ? 'yellow' : request.status === 'completed' ? 'green' : 'neutral'} />
        <T style={{ marginTop: 12 }}>Subscription: {request.subscription}</T>
        <T>Fee: {request.fee.toLocaleString('en-US')} RWF</T>
        <T muted small style={{ marginTop: 8 }}>Submitted {new Date(request.created_at).toLocaleString()}</T>
        {request.status === 'pending' ? <Btn label={saving ? 'Cancelling…' : 'Cancel request'} variant="primary" disabled={saving} style={{ marginTop: 14 }} onPress={cancel} /> : null}
        {request.status === 'in_progress' ? <T muted small style={{ marginTop: 14 }}>This request has started and cannot be cancelled.</T> : null}
      </Card> : null}
    </AdminScreen>
  );
}
