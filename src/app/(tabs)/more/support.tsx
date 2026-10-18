import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AdminScreen, Btn, Card, confirm, Gap, H, InfoBox, Input, Label, notify, T } from '@/components/ui';
import { firstName, useStore } from '@/data/store';
import { colors, fonts } from '@/theme';

export default function SupportInspection() {
  const { session, restaurants, sendGuidance, resolveSession } = useStore();
  const r = restaurants.find((x) => x.id === session.restaurantId)!;
  const manager = firstName(r.manager);
  const [reply, setReply] = useState('');

  const exit = () => router.back();

  const send = () => {
    if (!reply.trim()) return notify('Write a reply', `Type the guidance you want to send to ${manager}.`);
    sendGuidance(reply.trim());
    setReply('');
    notify('Help sent', `${manager} received your guidance in the app.`);
  };

  const resolve = () =>
    confirm('Resolve with summary?', `${session.ticket} will be closed and ${manager} receives the summary. This session ends.`, () => {
      resolveSession();
      notify('Support resolved', `${session.ticket} is resolved and the session has ended.`);
      router.back();
    }, 'Resolve');

  return (
    <AdminScreen title="Support inspection" back="More / Support" demo>
      <InfoBox title={session.resolved ? 'SUPPORT SESSION ENDED' : 'SUPPORT MODE · READ-ONLY'} tone="yellow">
        {`${r.name} · #${r.code} · Session ${session.id}\nAuthorized by ${session.authorizedBy} · Audited · ${session.window}`}
      </InfoBox>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <T>
          {r.plan} / {r.status} · {session.ticket}
        </T>
        <Btn label="Exit support" onPress={exit} />
      </View>

      <Card>
        <H>{session.topic}</H>
        {session.messages.map((m, i) =>
          m.from === 'Derrick' ? (
            <View key={i} style={{ backgroundColor: colors.greenBg, borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 6 }}>
              <T style={{ fontFamily: fonts.bodySemi, fontSize: 14.5, marginBottom: 4 }}>
                {m.from} · {m.time}
              </T>
              <T>{m.text}</T>
            </View>
          ) : (
            <View key={i} style={{ marginBottom: 10 }}>
              <T style={{ fontFamily: fonts.bodySemi, fontSize: 14.5, marginBottom: 4 }}>
                {m.from} · {m.time}
              </T>
              <T style={{ fontSize: 13.5, lineHeight: 19 }}>{m.text}</T>
            </View>
          ),
        )}
      </Card>

      <Card muted>
        <H>Operational / sync summary</H>
        <T style={{ fontSize: 13.5, lineHeight: 19, marginBottom: 8 }}>● {session.summary}</T>
        <T muted>Flags need review, not automatic corrections. Summaries are scoped to this tenant only.</T>
      </Card>

      {!session.resolved ? (
        <Card>
          <H>Send guidance</H>
          <Label>Reply to {manager}</Label>
          <Input
            value={reply}
            onChangeText={setReply}
            placeholder={`Type guidance to send to ${manager}...`}
            multiline
            style={{ minHeight: 84, textAlignVertical: 'top' }}
          />
          <Gap h={14} />
          <Btn label="Send help" variant="primary" onPress={send} />
          <Gap h={12} />
          <Btn label="Resolve with summary" onPress={resolve} />
          <T muted small style={{ marginTop: 12 }}>
            Messages and resolution are audited. Authorized restaurant managers make any corrections.
          </T>
        </Card>
      ) : null}

      <InfoBox title="Inspection only">
        No impersonation or edits to financial/stock history. Exit ends this session and returns to the support queue.
      </InfoBox>
      <Btn label="Exit & return to Support" onPress={exit} />
    </AdminScreen>
  );
}
