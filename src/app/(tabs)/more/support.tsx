import { AdminScreen, Card, H, InfoBox, T } from '@/components/ui';

export default function SupportInspection() {
  return (
    <AdminScreen title="Support" back="More / Support">
      <InfoBox title="Support is not connected" tone="yellow">
        The current Bara API does not provide support tickets, inspection sessions, or messaging endpoints. No sample ticket or support actions are shown here.
      </InfoBox>
      <Card>
        <H>What is needed to enable this screen?</H>
        <T>
          The backend needs endpoints for listing support tickets, viewing an authorized support session, sending a response, and resolving a ticket.
        </T>
      </Card>
    </AdminScreen>
  );
}
