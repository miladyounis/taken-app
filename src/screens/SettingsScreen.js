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

export default function SettingsScreen() {
  const [reminders, setReminders] = useState([]);
  const navigation = useNavigation();

  const load = useCallback(async () => {
    setReminders(await getReminders());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
