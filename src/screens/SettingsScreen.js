import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, font, radius } from '../theme';
import ReminderCard from '../components/ReminderCard';
import { getReminders, saveReminders } from '../utils/storage';
import { scheduleLocalReminder, cancelReminder } from '../utils/notifications';
import { useAuth } from '../lib/AuthContext';
import { getPartner, getInviteCode } from '../lib/couple';

export default function SettingsScreen() {
  const [reminders, setReminders] = useState([]);
  const [partner, setPartner] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const navigation = useNavigation();
  const { profile, signOut } = useAuth();

  const load = useCallback(async () => {
    setReminders(await getReminders());
    if (profile?.id && profile?.couple_id) {
      const [p, code] = await Promise.all([
        getPartner(profile.id, profile.couple_id),
        getInviteCode(profile.couple_id),
      ]);
      setPartner(p);
      setInviteCode(code);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const toggle = async (id) => {
    const updated = reminders.map((r) => {
      if (r.id !== id) return r;
      return { ...r, enabled: !r.enabled };
    });
    setReminders(updated);
    await saveReminders(updated);
    const r = updated.find((x) => x.id === id);
    if (r.enabled) {
      await scheduleLocalReminder({ id: r.id, title: 'taken? 💊', body: r.message, hour: r.hour, minute: r.minute });
    } else {
      await cancelReminder(r.id);
    }
  };

  const openEdit = (reminder) => {
    navigation.navigate('EditReminder', { reminder });
  };

  const addNew = () => {
    const newReminder = {
      id: `reminder_${Date.now()}`,
      label: 'New reminder',
      hour: 8,
      minute: 0,
      enabled: true,
      message: 'hey love, time for your pills! 💊',
    };
    navigation.navigate('EditReminder', { reminder: newReminder, isNew: true });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Account / couple */}
        <Text style={styles.heading}>you & your pair</Text>
        <View style={styles.accountCard}>
          <Text style={styles.accountName}>{profile?.display_name ?? 'You'}</Text>
          {partner ? (
            <Text style={styles.accountSub}>linked with {partner.display_name} 💞</Text>
          ) : (
            <>
              <Text style={styles.accountSub}>waiting for your partner — share this code:</Text>
              <View style={styles.codePill}><Text style={styles.codePillText}>{inviteCode ?? '…'}</Text></View>
            </>
          )}
          <TouchableOpacity style={styles.signOutBtn} onPress={confirmSignOut} activeOpacity={0.7}>
            <Text style={styles.signOutLabel}>sign out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heading}>reminders</Text>
        <Text style={styles.sub}>set the times and messages that work for you two.</Text>

        {reminders.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            onToggle={() => toggle(r.id)}
            onEdit={() => openEdit(r)}
          />
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addNew} activeOpacity={0.7}>
          <Text style={styles.addLabel}>+ add reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 48 },
  heading: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 28,
    color: colors.cocoa,
    marginBottom: 6,
  },
  accountCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 20,
    marginBottom: 32,
    marginTop: 4,
  },
  accountName: { fontFamily: font.family, fontWeight: font.weights.bold, fontSize: 18, color: colors.cocoa },
  accountSub: { fontFamily: font.family, fontSize: 14, color: colors.taupe, marginTop: 4 },
  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sand,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  codePillText: { fontFamily: font.family, fontWeight: font.weights.extraBold, fontSize: 22, letterSpacing: 4, color: colors.coralDeep },
  signOutBtn: { marginTop: 18, alignSelf: 'flex-start' },
  signOutLabel: { fontFamily: font.family, fontWeight: font.weights.semiBold, fontSize: 15, color: colors.stateMissed },
  sub: {
    fontFamily: font.family,
    fontSize: 15,
    color: colors.taupe,
    marginBottom: 24,
    lineHeight: 22,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: colors.coral,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
    borderStyle: 'dashed',
  },
  addLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 16,
    color: colors.coral,
  },
});
