import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, confirm, Field, notify, Page, SectionTitle, styles, ToggleRow } from '@/components/ui';
import { colors } from '@/theme';

const initialSessions = [
  { id: 'd1', device: 'This phone', place: 'Kigali · Active now', current: true },
  { id: 'd2', device: 'Chrome on Windows', place: 'Kigali · 2 hours ago', current: false },
  { id: 'd3', device: 'Samsung Galaxy A54', place: 'Musanze · 3 days ago', current: false },
];

export default function Security() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const [twoStep, setTwoStep] = useState(true);
  const [sessions, setSessions] = useState(initialSessions);

  const changePassword = () => {
    if (!current) return setError('Enter your current password.');
    if (next.length < 8) return setError('New password must be at least 8 characters.');
    if (next !== again) return setError('The new passwords do not match.');
    setError('');
    setCurrent('');
    setNext('');
    setAgain('');
    notify('Password changed', 'Use your new password the next time you sign in.');
  };

  return (
    <Page>
      <Text style={styles.eyebrow}>Security</Text>
      <Text style={styles.title}>Keep your account safe</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>This account can control every restaurant on Bara. Protect it well.</Text>

      <SectionTitle>Change password</SectionTitle>
      <Card>
        <Field label="Current password" secureTextEntry value={current} onChangeText={setCurrent} />
        <Field label="New password" secureTextEntry value={next} onChangeText={setNext} hint="At least 8 characters." />
        <Field label="Repeat new password" secureTextEntry value={again} onChangeText={setAgain} />
        {error ? <Text style={{ color: colors.danger, marginBottom: 8 }}>{error}</Text> : null}
        <Button label="Update password" onPress={changePassword} />
      </Card>

      <SectionTitle>Two-step sign-in</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <ToggleRow first label="Ask for an SMS code" hint="A 6-digit code is sent to +250 788 *** 111 each time you sign in on a new device" value={twoStep} onChange={setTwoStep} />
      </Card>

      <SectionTitle>Signed-in devices</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {sessions.map((d, i) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <Feather name={d.device.includes('Chrome') ? 'monitor' : 'smartphone'} size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.strong}>{d.device}</Text>
              <Text style={styles.muted}>{d.place}</Text>
            </View>
            {d.current ? (
              <Badge label="This device" tone="success" />
            ) : (
              <Button label="Sign out" variant="ghost" small onPress={() => setSessions((s) => s.filter((x) => x.id !== d.id))} />
            )}
          </View>
        ))}
      </Card>

      <Button
        label="Sign out of all devices"
        variant="danger"
        onPress={() => confirm('Sign out everywhere?', 'You will need to sign in again on every device, including this one.', () => router.replace('/'), 'Sign out')}
      />
    </Page>
  );
}
