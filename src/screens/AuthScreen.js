import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { colors, font, radius } from '../theme';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) { Alert.alert('Hold on', 'Enter your email and a password.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      // AuthContext picks up the session automatically.
    } catch (e) {
      Alert.alert('Something went wrong', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.inner}>
          <Text style={styles.wordmark}>taken<Text style={styles.q}>?</Text></Text>
          <Text style={styles.tagline}>did you take your pills, love?</Text>

          <View style={styles.card}>
            {mode === 'signup' && (
              <>
                <Text style={styles.fieldLabel}>your name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Milad"
                  placeholderTextColor={colors.mist}
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mist}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mist}
              secureTextEntry
            />

            <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy} activeOpacity={0.85}>
              {busy
                ? <ActivityIndicator color={colors.onCoral} />
                : <Text style={styles.btnLabel}>{mode === 'signup' ? 'create account' : 'sign in'}</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            <Text style={styles.switchText}>
              {mode === 'signup'
                ? 'already have an account? sign in'
                : 'new here? create an account'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  wordmark: {
    fontFamily: 'Nunito_600SemiBold_Italic',
    fontSize: 56,
    color: colors.cocoa,
    textAlign: 'center',
  },
  q: { color: colors.coral },
  tagline: {
    fontFamily: 'Nunito_300Light_Italic',
    fontSize: 18,
    color: colors.taupe,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 22,
  },
  fieldLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.bold,
    fontSize: 12,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.mist,
    marginBottom: 6,
    marginTop: 14,
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
  btn: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnLabel: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 17,
    color: colors.onCoral,
  },
  switchText: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.coralDeep,
    textAlign: 'center',
    marginTop: 22,
  },
});
