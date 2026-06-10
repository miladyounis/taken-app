import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, font, radius } from '../theme';
import TakenButton from '../components/TakenButton';
import { getReminders, getTodayLog, logDose, getStreak } from '../utils/storage';
import { registerForPushNotifications, scheduleLocalReminder } from '../utils/notifications';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'good morning, love ☀️';
  if (h < 18) return 'hey there, love 💛';
  return 'good evening, love 🌙';
}

export default function HomeScreen() {
  const [reminders, setReminders] = useState([]);
  const [takenToday, setTakenToday] = useState([]);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [r, log, s] = await Promise.all([getReminders(), getTodayLog(), getStreak()]);
    setReminders(r.filter((x) => x.enabled));
    setTakenToday(log);
    setStreak(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    registerForPushNotifications();
    load();
  }, []);

  const handleTake = async (reminder) => {
    await logDose(reminder.id);
    load();
  };

  const allTaken = reminders.length > 0 && reminders.every((r) => takenToday.includes(r.id));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.coral} />}
      >
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.sub}>did you take your pills{allTaken ? ', love? ✓' : '?'}</Text>

        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} day streak</Text>
          </View>
        )}

        {reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>no reminders set yet{'\n'}go to settings to add some 💊</Text>
          </View>
        ) : (
          reminders.map((r) => {
            const taken = takenToday.includes(r.id);
            return (
              <View key={r.id} style={styles.doseCard}>
                <Text style={styles.doseLabel}>{r.label}</Text>
                <Text style={styles.doseMessage}>{r.message}</Text>
                <View style={styles.btnRow}>
                  <TakenButton taken={taken} onPress={() => handleTake(r)} />
                </View>
              </View>
            );
          })
        )}

        {allTaken && (
          <View style={styles.allGoodCard}>
            <Text style={styles.allGoodText}>all done for today, love 💕{'\n'}i'm proud of you.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 48 },
  greeting: {
    fontFamily: font.family,
    fontWeight: font.weights.light,
    fontStyle: 'italic',
    fontSize: 30,
    color: colors.cocoa,
    marginBottom: 4,
  },
  sub: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 22,
    color: colors.cocoa,
    marginBottom: 24,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1D6',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    marginBottom: 20,
  },
  streakText: {
    fontFamily: font.family,
    fontWeight: font.weights.bold,
    fontSize: 14,
    color: '#8A5E12',
  },
  doseCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 22,
    marginBottom: 16,
  },
  doseLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.bold,
    fontSize: 18,
    color: colors.cocoa,
    marginBottom: 6,
  },
  doseMessage: {
    fontFamily: font.family,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.taupe,
    marginBottom: 18,
  },
  btnRow: { alignItems: 'center' },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: font.family,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.taupe,
    textAlign: 'center',
    lineHeight: 26,
  },
  allGoodCard: {
    backgroundColor: colors.stateTakenBg,
    borderRadius: radius.md,
    padding: 22,
    alignItems: 'center',
    marginTop: 8,
  },
  allGoodText: {
    fontFamily: font.family,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.stateTaken,
    textAlign: 'center',
    lineHeight: 26,
  },
});
