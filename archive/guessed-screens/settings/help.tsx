import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Card, Page, SectionTitle, styles } from '@/components/ui';
import { colors } from '@/theme';

const faqs = [
  {
    q: 'How do I add a new restaurant?',
    a: 'Go to Restaurants and tap "+ Add". Enter the restaurant details and the manager\'s phone number. The manager gets an SMS invite to set their PIN. The restaurant stays Pending until you approve it.',
  },
  {
    q: 'How do I approve a pending restaurant?',
    a: 'Open the Requests tab and tap "Approve" on the request, or open the restaurant and tap "Approve restaurant". The manager can sign in straight away.',
  },
  {
    q: 'A manager forgot their PIN. What do I do?',
    a: 'Open the restaurant, go to Manager access and tap "Reset PIN". The manager receives an SMS to choose a new PIN. Their staff can keep working during the reset.',
  },
  {
    q: 'What happens when I suspend a restaurant?',
    a: 'All staff at that restaurant are signed out and cannot take new orders. Their data is kept. Tap "Reactivate restaurant" to give access back.',
  },
  {
    q: 'What does "Synced 2 min ago" mean?',
    a: 'Each restaurant\'s POS keeps working offline and uploads orders when it reconnects. The time shows the last successful upload. If a restaurant has not synced for a day, check its internet connection.',
  },
  {
    q: 'How are restaurants billed?',
    a: 'Each restaurant pays a monthly plan: Starter, Standard or Premium. See More → Plans & billing for prices and unpaid invoices. Restaurants 7 days overdue are suspended automatically.',
  },
];

const contacts: { icon: keyof typeof Feather.glyphMap; label: string; value: string; url: string }[] = [
  { icon: 'phone', label: 'Call support', value: '+250 788 000 111', url: 'tel:+250788000111' },
  { icon: 'message-circle', label: 'WhatsApp', value: '+250 788 000 111', url: 'https://wa.me/250788000111' },
  { icon: 'mail', label: 'Email', value: 'support@bara.rw', url: 'mailto:support@bara.rw' },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Page>
      <Text style={styles.eyebrow}>Help & support</Text>
      <Text style={styles.title}>How can we help?</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>Answers to common questions about managing restaurants on Bara.</Text>

      <SectionTitle>Frequently asked questions</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <View key={f.q} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <Pressable onPress={() => setOpen(isOpen ? null : i)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 }}>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text }}>{f.q}</Text>
                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
              </Pressable>
              {isOpen ? <Text style={{ fontSize: 14, lineHeight: 21, color: '#4A3A2E', paddingBottom: 14 }}>{f.a}</Text> : null}
            </View>
          );
        })}
      </Card>

      <SectionTitle>Contact the Bara team</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {contacts.map((c, i) => (
          <Pressable
            key={c.label}
            onPress={() => Linking.openURL(c.url)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={c.icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{c.label}</Text>
              <Text style={styles.muted}>{c.value}</Text>
            </View>
            <Feather name="external-link" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <Card muted>
        <Text style={styles.strong}>Support hours</Text>
        <Text style={styles.muted}>Monday – Saturday, 7:00 – 22:00 (Kigali time). Urgent outages are handled 24/7.</Text>
      </Card>
    </Page>
  );
}
