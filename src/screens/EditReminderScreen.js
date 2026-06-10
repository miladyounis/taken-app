import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, font, radius } from '../theme';
import { getReminders, saveReminders } from '../utils/storage';
import { scheduleLocalReminder, cancelReminder } from '../utils/notifications';

export default function EditReminderScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { reminder: initial, isNew } = params;

  const [label, setLabel] = useState(initial.label);
  const [hour, setHour] = useState(String(initial.hour));
  const [minute, setMinute] = useState(String(initial.minute).padStart(2, '0'));
  const [message, setMessage] = useState(initial.message);

  const save = async () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23) { Alert.alert('Invalid hour', 'Enter a number 0–23.'); return; }
    if (isNaN(m) || m < 0 || m > 59) { Alert.alert('Invalid minute', 'Enter a number 0–59.'); return; }

    const updated = { ...initial, label, hour: h, minute: m, message };
    const all = await getReminders();
    const idx = all.findIndex((r) => r.id === updated.id);
    if (idx >= 0) all[idx] = updated;
    else all.push(updated);

    await saveReminders(all);

    if (updated.enabled) {
      await scheduleLocalReminder({ id: updated.id, title: 'taken? 💊', body: updated.message, hour: h, minute: m });
    }

    navigation.goBack();
  };

  const remove = async () => {
    Alert.alert('Delete reminder?', 'This will also cancel the scheduled notification.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const all = await getReminders();
          await saveReminders(all.filter((r) => r.id !== initial.id));
          await cancelReminder(initial.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{isNew ? 'new reminder' : 'edit reminder'}</Text>

        <Text style={styles.fieldLabel}>label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Morning pills"
          placeholderTextColor={colors.mist}
        />

        <Text style={styles.fieldLabel}>time</Text>
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={hour}
            onChangeText={setHour}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="09"
            placeholderTextColor={colors.mist}
          />
          <Text style={styles.timeSep}>:</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={minute}
            onChangeText={setMinute}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="00"
            placeholderTextColor={colors.mist}
          />
        </View>

        <Text style={styles.fieldLabel}>notification message</Text>
        <TextInput
          style={[styles.input, styles.multiInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="hey love, time for your pills! 💊"
          placeholderTextColor={colors.mist}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.8}>
          <Text style={styles.saveBtnLabel}>save reminder</Text>
        </TouchableOpacity>

        {!isNew && (
          <TouchableOpacity style={styles.deleteBtn} onPress={remove} activeOpacity={0.7}>
            <Text style={styles.deleteBtnLabel}>delete reminder</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 60 },
  heading: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 26,
    color: colors.cocoa,
    marginBottom: 28,
  },
  fieldLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.bold,
    fontSize: 13,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.mist,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.sand,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: font.family,
    fontSize: 16,
    color: colors.cocoa,
  },
  multiInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    width: 72,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: font.weights.bold,
  },
  timeSep: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 24,
    color: colors.cocoa,
  },
  saveBtn: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 17,
    color: colors.onCoral,
  },
  deleteBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteBtnLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 15,
    color: colors.stateMissed,
  },
});
