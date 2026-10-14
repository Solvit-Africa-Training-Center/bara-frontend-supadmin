import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Field, SectionTitle, styles } from '@/components/ui';
import { useStore, type Restaurant } from '@/data/store';
import { colors } from '@/theme';

const plans: Restaurant['plan'][] = ['Starter', 'Standard', 'Premium'];

export default function NewRestaurant() {
  const { addRestaurant, restaurants } = useStore();
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState<Restaurant['plan']>('Standard');
  const [manager, setManager] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    if (!name.trim() || !district.trim() || !manager.trim() || !phone.trim()) {
      setError('Fill in restaurant name, district, manager name and phone.');
      return;
    }
    const code = `RW-${String(600 + restaurants.length).padStart(3, '0')}`;
    const r = addRestaurant({
      name: name.trim(),
      code,
      district: district.trim(),
      address: address.trim() || '—',
      plan,
      staff: 1,
      manager: { name: manager.trim(), phone: phone.trim(), email: email.trim() || '—' },
    });
    router.replace({ pathname: '/restaurant/[id]', params: { id: r.id } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Onboarding</Text>
        <Text style={styles.title}>Add restaurant & manager access</Text>
        <Text style={[styles.subtitle, { marginBottom: 16 }]}>
          The manager gets an SMS invite to set their PIN. The restaurant stays pending until you approve it.
        </Text>

        <SectionTitle>Restaurant</SectionTitle>
        <Card>
          <Field label="Restaurant name" placeholder="e.g. Kigali Heights Bistro" value={name} onChangeText={setName} />
          <Field label="District" placeholder="e.g. Gasabo" value={district} onChangeText={setDistrict} />
          <Field label="Address" placeholder="Street or building" value={address} onChangeText={setAddress} />
          <Text style={styles.label}>Plan</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {plans.map((p) => (
              <Chip key={p} label={p} active={plan === p} onPress={() => setPlan(p)} />
            ))}
          </View>
        </Card>

        <SectionTitle>Manager</SectionTitle>
        <Card>
          <Field label="Full name" placeholder="e.g. Aline Uwase" value={manager} onChangeText={setManager} />
          <Field label="Phone" placeholder="+250 7xx xxx xxx" keyboardType="phone-pad" value={phone} onChangeText={setPhone} hint="The invite is sent here." />
          <Field label="Email (optional)" placeholder="manager@restaurant.rw" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </Card>

        {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
        <Button label="Create restaurant & send invite" onPress={save} />
        <View style={{ height: 8 }} />
        <Button label="Cancel" variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
