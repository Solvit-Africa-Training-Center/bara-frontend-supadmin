import { useState } from 'react';
import { Text } from 'react-native';
import { Card, Page, SectionTitle, styles, ToggleRow } from '@/components/ui';

export default function Notifications() {
  const [s, setS] = useState({
    newRestaurant: true,
    pinReset: true,
    billing: true,
    offline: true,
    dailySummary: false,
    push: true,
    sms: false,
    email: true,
  });
  const set = (k: keyof typeof s) => (v: boolean) => setS((x) => ({ ...x, [k]: v }));

  return (
    <Page>
      <Text style={styles.eyebrow}>Notifications</Text>
      <Text style={styles.title}>What should alert you?</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>Choose which events notify you and how they reach you.</Text>

      <SectionTitle>Events</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <ToggleRow first label="New restaurant sign-ups" hint="When a restaurant is waiting for approval" value={s.newRestaurant} onChange={set('newRestaurant')} />
        <ToggleRow label="Manager access problems" hint="Locked PINs and reset requests" value={s.pinReset} onChange={set('pinReset')} />
        <ToggleRow label="Billing issues" hint="Overdue payments and automatic suspensions" value={s.billing} onChange={set('billing')} />
        <ToggleRow label="Restaurant offline" hint="No sync for more than 24 hours" value={s.offline} onChange={set('offline')} />
        <ToggleRow label="Daily summary" hint="Platform sales and orders every evening at 22:00" value={s.dailySummary} onChange={set('dailySummary')} />
      </Card>

      <SectionTitle>Send them by</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <ToggleRow first label="Push notification" value={s.push} onChange={set('push')} />
        <ToggleRow label="SMS" value={s.sms} onChange={set('sms')} />
        <ToggleRow label="Email" value={s.email} onChange={set('email')} />
      </Card>
      <Text style={[styles.muted, { textAlign: 'center' }]}>Changes are saved automatically.</Text>
    </Page>
  );
}
