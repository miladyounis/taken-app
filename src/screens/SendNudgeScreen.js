import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, font, radius } from '../theme';
import { useAuth } from '../lib/AuthContext';
import { sendNudge } from '../lib/couple';

const PRESETS = [
  'did you take your pills, love? 💊',
  'good morning sunshine ☀️ pill time!',
  'hey you 🥰 don\'t forget your meds',
  'taken? 👀 (the pills, not your heart — that\'s mine)',
  'quick! pills before you forget 💕',
];

export default function SendNudgeScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { profile } = useAuth();
  const partnerProfile = params?.partner;

  const [message, setMessage] = useState(PRESETS[0]);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!message.trim()) { Alert.alert('Write something', 'Add a little message first.'); return; }
    if (!partnerProfile?.id) { Alert.alert('No partner yet', 'You need to be linked with your partner first.'); return; }
    setBusy(true);
    try {
      await sendNudge({
        coupleId: profile.couple_id,
        fromUser: profile.id,
        toUser: partnerProfile.id,
        message: message.trim(),
      });
      navigation.goBack();
      Alert.alert('Sent 💛', `${partnerProfile.display_name ?? 'Your love'} just got your nudge.`);
    } catch (e) {
      Alert.alert('Could not send', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>nudge {partnerProfile?.display_name ?? 'your love'}</Text>
        <Text style={styles.sub}>pick a line or write your own.</Text>

        {PRESETS.map((p) => {
          const active = message === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.preset, active && styles.presetActive]}
              onPress={() => setMessage(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetText, active && styles.presetTextActive]}>{p}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.fieldLabel}>your message</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder="write something sweet or silly…"
          placeholderTextColor={colors.mist}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={busy} activeOpacity={0.85}>
          {busy ? <ActivityIndicator color={colors.onCoral} /> : <Text style={styles.sendLabel}>send nudge 💛</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 48 },
  heading: { fontFamily: font.family, fontWeight: font.weights.extraBold, fontSize: 26, color: colors.cocoa },
  sub: { fontFamily: font.family, fontSize: 15, color: colors.taupe, marginTop: 4, marginBottom: 20 },
  preset: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    marginBottom: 10,
  },
  presetActive: { borderColor: colors.coral, backgroundColor: colors.stateDueBg },
  presetText: { fontFamily: font.family, fontSize: 15, color: colors.cocoa },
  presetTextActive: { color: colors.coralDeep, fontWeight: font.weights.semiBold },
  fieldLabel: {
    fontFamily: font.family, fontWeight: font.weights.bold, fontSize: 12,
    letterSpacing: 0.12, textTransform: 'uppercase', color: colors.mist,
    marginTop: 18, marginBottom: 8,
  },
  input: {
    backgroundColor: colors.sand,
    borderRadius: radius.sm,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: font.family,
    fontSize: 16,
    color: colors.cocoa,
  },
  sendBtn: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  sendLabel: { fontFamily: font.family, fontWeight: font.weights.semiBold, fontSize: 17, color: colors.onCoral },
});
