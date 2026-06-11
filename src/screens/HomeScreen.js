import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, font, radius } from '../theme';
import { useAuth } from '../lib/AuthContext';
import { getPartner, confirmDose, getInviteCode } from '../lib/couple';
import { useCoupleNudges } from '../hooks/useCoupleNudges';

function greeting(name) {
  const h = new Date().getHours();
  const who = name ? `, ${name}` : ', love';
  if (h < 12) return `good morning${who} ☀️`;
  if (h < 18) return `hey there${who} 💛`;
  return `good evening${who} 🌙`;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [partner, setPartner] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { pending, refresh } = useCoupleNudges(profile?.id);

  const loadPartner = useCallback(async () => {
    if (profile?.id && profile?.couple_id) {
      const [p, code] = await Promise.all([
        getPartner(profile.id, profile.couple_id),
        getInviteCode(profile.couple_id),
      ]);
      setPartner(p);
      setInviteCode(code);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { loadPartner(); refresh(); }, [loadPartner, refresh]));
  useEffect(() => { loadPartner(); }, [loadPartner]);

  const onConfirm = async (nudge) => {
    try {
      await confirmDose({
        coupleId: profile.couple_id,
        userId: profile.id,
        partnerId: partner?.id,
        partnerToken: partner?.expo_push_token,
        myName: profile.display_name,
        nudgeId: nudge.id,
        label: nudge.message,
      });
      refresh();
      Alert.alert('✓ taken!', partner ? `${partner.display_name} will know you took them 💕` : 'Logged 💕');
    } catch (e) {
      Alert.alert('Hmm', e.message ?? String(e));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await Promise.all([loadPartner(), refresh()]); setRefreshing(false); }}
            tintColor={colors.coral}
          />
        }
      >
        <Text style={styles.greeting}>{greeting(profile?.display_name)}</Text>

        {/* Partner status */}
        {partner ? (
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>linked with {partner.display_name} 💞</Text>
          </View>
        ) : (
          <View style={styles.waitingCard}>
            <Text style={styles.waitingTitle}>waiting for your partner to join</Text>
            <Text style={styles.waitingBody}>share this code with them, then pull down to refresh.</Text>
            {inviteCode && (
              <View style={styles.codePill}>
                <Text style={styles.codePillText}>{inviteCode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Incoming nudges to confirm */}
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>for you 💌</Text>
            {pending.map((n) => (
              <View key={n.id} style={styles.nudgeCard}>
                <Text style={styles.nudgeMsg}>{n.message}</Text>
                <TouchableOpacity style={styles.takenBtn} onPress={() => onConfirm(n)} activeOpacity={0.85}>
                  <Text style={styles.takenLabel}>i took it</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {pending.length === 0 && partner && (
          <View style={styles.calmCard}>
            <Text style={styles.calmText}>nothing to take right now 🌿{'\n'}all caught up, love.</Text>
          </View>
        )}

        {/* Send a nudge */}
        {partner && (
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => navigation.navigate('SendNudge', { partner })}
            activeOpacity={0.85}
          >
            <Text style={styles.sendLabel}>💊  nudge {partner.display_name}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 48 },
  greeting: {
    fontFamily: 'Nunito_300Light_Italic',
    fontSize: 30,
    color: colors.cocoa,
    marginBottom: 16,
  },
  linkRow: { marginBottom: 22 },
  linkText: { fontFamily: font.family, fontWeight: font.weights.semiBold, fontSize: 15, color: colors.plum },
  waitingCard: {
    backgroundColor: '#FFF1D6',
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 22,
  },
  waitingTitle: { fontFamily: font.family, fontWeight: font.weights.bold, fontSize: 15, color: '#8A5E12' },
  waitingBody: { fontFamily: font.family, fontSize: 14, color: '#8A5E12', marginTop: 4, lineHeight: 20 },
  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  codePillText: {
    fontFamily: font.family, fontWeight: font.weights.extraBold,
    fontSize: 22, letterSpacing: 4, color: colors.coralDeep,
  },
  sectionLabel: {
    fontFamily: font.family, fontWeight: font.weights.extraBold, fontSize: 13,
    letterSpacing: 0.14, textTransform: 'uppercase', color: colors.coralDeep, marginBottom: 12,
  },
  nudgeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 22,
    marginBottom: 14,
  },
  nudgeMsg: { fontFamily: font.family, fontSize: 18, color: colors.cocoa, lineHeight: 26, marginBottom: 18 },
  takenBtn: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  takenLabel: { fontFamily: font.family, fontWeight: font.weights.semiBold, fontSize: 16, color: colors.onCoral },
  calmCard: {
    backgroundColor: colors.stateTakenBg,
    borderRadius: radius.md,
    padding: 22,
    alignItems: 'center',
    marginBottom: 22,
  },
  calmText: {
    fontFamily: 'Nunito_300Light_Italic',
    fontSize: 16, color: colors.stateTaken, textAlign: 'center', lineHeight: 24,
  },
  sendBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  sendLabel: { fontFamily: font.family, fontWeight: font.weights.semiBold, fontSize: 16, color: colors.coralDeep },
});
