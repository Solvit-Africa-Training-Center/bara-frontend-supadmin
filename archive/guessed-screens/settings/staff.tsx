import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Badge, Button, Card, Chip, confirm, Field, Page, SectionTitle, styles } from '@/components/ui';
import { useStore, type StaffRole } from '@/data/store';
import { colors } from '@/theme';

const roles: { role: StaffRole; hint: string }[] = [
  { role: 'Admin', hint: 'Can add, approve and suspend restaurants' },
  { role: 'Support', hint: 'Can view restaurants and resolve requests' },
];

export default function Staff() {
  const { staff, inviteStaff, removeStaff } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('Support');
  const [error, setError] = useState('');

  const invite = () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a name and a valid email.');
      return;
    }
    inviteStaff(name.trim(), email.trim(), role);
    setName('');
    setEmail('');
    setError('');
    setShowForm(false);
  };

  return (
    <Page>
      <Text style={styles.eyebrow}>Platform staff</Text>
      <Text style={styles.title}>Who can use this app</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>People at Bara with Super Admin access. Restaurant staff are managed by each restaurant.</Text>

      <Card style={{ paddingVertical: 4 }}>
        {staff.map((s, i) => (
          <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: '800', color: colors.primary }}>{s.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.strong}>{s.name}</Text>
              <Text style={styles.muted}>{s.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Badge label={s.role} tone={s.role === 'Owner' ? 'primary' : 'neutral'} />
              {s.invited ? <Badge label="Invited" tone="warning" /> : null}
            </View>
            {s.role !== 'Owner' ? (
              <Pressable
                hitSlop={8}
                onPress={() => confirm('Remove access?', `${s.name} will no longer be able to sign in.`, () => removeStaff(s.id), 'Remove')}
              >
                <Feather name="trash-2" size={18} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </Card>

      {showForm ? (
        <>
          <SectionTitle>Invite a team member</SectionTitle>
          <Card>
            <Field label="Full name" placeholder="e.g. Aline U." value={name} onChangeText={setName} />
            <Field label="Work email" placeholder="name@bara.rw" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <Text style={styles.label}>Role</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              {roles.map((r) => (
                <Chip key={r.role} label={r.role} active={role === r.role} onPress={() => setRole(r.role)} />
              ))}
            </View>
            <Text style={[styles.hint, { marginBottom: 12 }]}>{roles.find((r) => r.role === role)?.hint}</Text>
            {error ? <Text style={{ color: colors.danger, marginBottom: 8 }}>{error}</Text> : null}
            <Button label="Send invite" onPress={invite} />
            <View style={{ height: 8 }} />
            <Button label="Cancel" variant="outline" onPress={() => setShowForm(false)} />
          </Card>
        </>
      ) : (
        <Button label="+ Invite team member" onPress={() => setShowForm(true)} />
      )}
    </Page>
  );
}
