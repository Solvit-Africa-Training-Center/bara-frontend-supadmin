import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { BaraLogo, Button, Card, Field, Screen, styles } from '@/components/ui';
import { colors } from '@/theme';

// Sign-in for the platform owner. Credentials are not checked yet: no backend exists.
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 32 }}>
        <BaraLogo size={40} />
        <Text style={[styles.eyebrow, { marginTop: 16 }]}>Super Admin</Text>
        <Text style={[styles.title, { textAlign: 'center' }]}>Sign in to Bara</Text>
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>Manage every restaurant on the platform.</Text>
      </View>
      <Card>
        <Field
          label="Email"
          placeholder="admin@bara.rw"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Field label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
        <Button label="Sign in" onPress={() => router.replace('/(tabs)')} />
      </Card>
      <Text style={[styles.muted, { textAlign: 'center', color: colors.textMuted }]}>
        Only Bara platform staff can access this app.
      </Text>
    </Screen>
  );
}
