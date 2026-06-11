import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { colors, font, radius } from '../theme';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function PairingScreen() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [myCode, setMyCode] = useState(null);
  const [busy, setBusy] = useState(false);

  const createCouple = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('create_couple');
      if (error) throw error;
      setMyCode(data);
      await refreshProfile();
    } catch (e) {
      Alert.alert('Could not create', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const joinCouple = async () => {
    if (!code.trim()) { Alert.alert('Enter a code', 'Type the code your partner shared.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.rpc('join_couple', { code: code.trim() });
      if (error) throw error;
      await refreshProfile();
    } catch (e) {
      Alert.alert('Could not join', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  // If a code was created, show it for sharing until the partner joins.
  if (myCode) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <Text style={styles.heading}>you're almost there 💛</Text>
          <Text style={styles.body}>share this code with your love. once they enter it, you're linked.</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{myCode}</Text>
          </View>
          <Text style={styles.hint}>waiting for them to join…</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={refreshProfile}>
            <Text style={styles.refreshLabel}>I've linked — continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        <Text style={styles.heading}>hi {profile?.display_name ?? 'love'} 👋</Text>
        <Text style={styles.body}>taken? works in pairs. link with your partner to start nudging each other.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>start a new pair</Text>
          <Text style={styles.cardBody}>you'll get a code to share with them.</Text>
          <TouchableOpacity style={styles.btn} onPress={createCouple} disabled={busy} activeOpacity={0.85}>
            {busy ? <ActivityIndicator color={colors.onCoral} /> : <Text style={styles.btnLabel}>create a pair</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.or}>— or —</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>join your partner</Text>
          <Text style={styles.cardBody}>enter the code they shared with you.</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor={colors.mist}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={joinCouple} disabled={busy} activeOpacity={0.85}>
            <Text style={[styles.btnLabel, styles.btnOutlineLabel]}>join pair</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOut}>sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  heading: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 28,
    color: colors.cocoa,
    marginBottom: 8,
  },
  body: {
    fontFamily: font.family,
    fontSize: 16,
    color: colors.taupe,
    lineHeight: 24,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 20,
  },
  cardTitle: {
    fontFamily: font.family,
    fontWeight: font.weights.bold,
    fontSize: 18,
    color: colors.cocoa,
  },
  cardBody: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.taupe,
    marginTop: 4,
    marginBottom: 14,
  },
  input: {
    backgroundColor: colors.sand,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: font.family,
    fontSize: 22,
    fontWeight: font.weights.bold,
    letterSpacing: 4,
    textAlign: 'center',
    color: colors.cocoa,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 16,
    color: colors.onCoral,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.coral,
  },
  btnOutlineLabel: { color: colors.coralDeep },
  or: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.mist,
    textAlign: 'center',
    marginVertical: 18,
  },
  codeBox: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.coral,
    borderStyle: 'dashed',
    paddingVertical: 28,
    alignItems: 'center',
    marginVertical: 12,
  },
  code: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 44,
    letterSpacing: 8,
    color: colors.coralDeep,
  },
  hint: {
    fontFamily: 'Nunito_300Light_Italic',
    fontSize: 15,
    color: colors.taupe,
    textAlign: 'center',
    marginTop: 8,
  },
  refreshBtn: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  refreshLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 16,
    color: colors.onCoral,
  },
  signOut: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.coralDeep,
    textAlign: 'center',
    marginTop: 28,
  },
});
