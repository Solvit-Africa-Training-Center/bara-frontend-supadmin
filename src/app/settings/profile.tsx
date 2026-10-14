import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Page, Row, SectionTitle, styles } from '@/components/ui';
import { colors } from '@/theme';

export default function Profile() {
  const [name, setName] = useState('Patrick N.');
  const [phone, setPhone] = useState('+250 788 000 111');
  const [saved, setSaved] = useState(false);

  return (
    <Page>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 28 }}>{name.trim()[0] ?? '?'}</Text>
        </View>
        <Text style={[styles.title, { marginTop: 8 }]}>{name || 'Your name'}</Text>
        <Text style={styles.muted}>Owner · Bara platform</Text>
      </View>

      <SectionTitle>Your details</SectionTitle>
      <Card>
        <Field label="Full name" value={name} onChangeText={(v) => { setName(v); setSaved(false); }} />
        <Field label="Phone" keyboardType="phone-pad" value={phone} onChangeText={(v) => { setPhone(v); setSaved(false); }} />
        <Row label="Email" value="admin@bara.rw" />
        <Text style={[styles.hint, { marginBottom: 12 }]}>Ask another Owner to change your email.</Text>
        <Button label={saved ? 'Saved ✓' : 'Save changes'} onPress={() => setSaved(true)} />
      </Card>

      <Button label="Back to More" variant="outline" onPress={() => router.back()} />
    </Page>
  );
}
