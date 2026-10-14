import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, notify, Pill, PlanFeatures, Row, T } from '@/components/ui';
import { firstName, rwf, useStore } from '@/data/store';
import { fonts } from '@/theme';

export default function ReviewRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requests, approveRequest, rejectRequest } = useStore();
  const q = requests.find((r) => r.id === id);
  const [audit, setAudit] = useState(q?.kind === 'New restaurant' ? `Verified onboarding payment · ${q.id}` : '');
  const [rejection, setRejection] = useState('');

  if (!q) {
    return (
      <AdminScreen title="Review request" back="Requests">
        <T muted>Request not found.</T>
      </AdminScreen>
    );
  }

  const p = q.payment;
  const name = firstName(q.manager);
  const paymentOk = !p || p.verified;
  const done = q.status === 'Completed';

  const approveText = {
    'New restaurant': `On approval: create one tenant, apply ${q.plan}, email ${name} an invitation valid for 72 hours, and log the decision.`,
    'Plan change': `On approval: apply ${q.plan} to ${q.restaurant}, email ${name} a confirmation, and log the decision.`,
    'Manager access': `On approval: send ${name} a new secure invitation valid for 72 hours and log the decision.`,
  }[q.kind];

  const approve = () => {
    if (!audit.trim()) return notify('Audit reason required', 'Enter an audit reason before approving.');
    confirm('Approve & notify manager?', approveText, () => {
      approveRequest(q.id, audit.trim());
      notify('Request approved', `${q.id} is complete. ${name} has been notified.`);
      router.back();
    }, 'Approve');
  };

  const reject = () => {
    if (!rejection.trim()) return notify('Rejection reason required', 'Explain what must be corrected before rejecting.');
    confirm('Reject & notify?', `Rejection grants no access. ${name} receives the reason by email and in-app notification.`, () => {
      rejectRequest(q.id, rejection.trim());
      notify('Request rejected', `${name} has been sent the reason.`);
      router.back();
    }, 'Reject');
  };

  return (
    <AdminScreen title="Review request" back="Requests">
      <Row gap={14} style={{ marginBottom: 14 }}>
        <Pill label={`${q.id} · ${q.status}`} tone={done ? 'green' : 'yellow'} />
        <T muted>{q.submitted}</T>
      </Row>

      <Card>
        <H>{q.restaurant}</H>
        <T style={{ marginBottom: 12 }}>
          {q.location} · One location {q.manager} · Primary manager
        </T>
        <T muted style={{ marginBottom: 12 }}>
          {q.email} · {q.phone}
        </T>
        <T>{q.checks}</T>
      </Card>

      {p ? (
        <Card>
          <H>Payment verification</H>
          <Row gap={14} style={{ marginBottom: 12 }}>
            <Pill label={p.verified ? 'Verified' : 'Not verified'} tone={p.verified ? 'green' : 'yellow'} />
            {p.verified ? (
              <T muted>
                {p.verifiedBy} · {p.verifiedAt}
              </T>
            ) : null}
          </Row>
          <T style={{ fontFamily: fonts.bodyBold, fontSize: 18, marginBottom: 10 }}>
            {p.reference} · {rwf(p.amount)}
          </T>
          <T style={{ marginBottom: 14 }}>
            {p.method} {p.note}
          </T>
          <Btn
            label="View receipt evidence"
            onPress={() => notify('Receipt evidence', `${p.reference}\n${rwf(p.amount)}\n${p.method}\n${p.note}`)}
          />
          <T muted small style={{ marginTop: 10 }}>
            Sample amount, not an official plan price.
          </T>
        </Card>
      ) : null}

      <Card muted>
        <H>{q.kind === 'Manager access' ? 'Access to restore' : 'Paid access to approve'}</H>
        <PlanFeatures plan={q.plan} />
        {q.period ? (
          <T style={{ fontFamily: fonts.bodySemi, fontSize: 17, marginTop: 6, marginBottom: 10 }}>
            {q.period.start.replace(' 2026', '')} – {q.period.end} · Active
          </T>
        ) : null}
        <T style={{ marginBottom: 12 }}>{q.restaurant} only · No platform access</T>
        <Label>Audit reason</Label>
        <Input value={audit} onChangeText={setAudit} placeholder="Why are you approving?" editable={!done} />
      </Card>

      {done ? (
        <InfoBox title="Decision recorded">{q.outcome}</InfoBox>
      ) : (
        <>
          {paymentOk ? (
            <InfoBox title="Approval gates passed">
              {`Identity ✓  Payment ✓  Plan and dates ✓\n${approveText}`}
            </InfoBox>
          ) : (
            <InfoBox title="Approval blocked" tone="yellow">
              {`Identity ✓  Payment ✗  Plan and dates ✓\nPayment ${p?.reference} is not verified. Verify it in the ledger or reject with a reason.`}
            </InfoBox>
          )}
          <Btn label="Approve & notify manager" variant="primary" disabled={!paymentOk} onPress={approve} />
          <Gap h={14} />
          <Label>Rejection reason · required to reject</Label>
          <Input placeholder="Explain what must be corrected..." value={rejection} onChangeText={setRejection} />
          <Gap h={12} />
          <Btn label="Review rejection & notify" onPress={reject} />
          <T muted small style={{ marginTop: 12 }}>
            Rejection grants no access. {name} receives the reason by email and in-app notification.
          </T>
        </>
      )}
    </AdminScreen>
  );
}
