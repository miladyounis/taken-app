import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Vibration,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import notifee from '@notifee/react-native';
import { colors, font, radius } from '../theme';
import { useAuth } from '../lib/AuthContext';
import { getPartner, confirmDose } from '../lib/couple';
import { uploadConfirmationSelfie } from '../lib/storage';

export default function AlarmScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const nudge = params?.nudge ?? { id: null, message: 'did you take your pills, love?' };
  const { profile } = useAuth();

  const [partner, setPartner] = useState(null);
  const [mode, setMode] = useState('prompt'); // 'prompt' | 'camera' | 'saving'
  const [permission, requestPermission] = useCameraPermissions();
  let cameraRef = null;

  useEffect(() => {
    Vibration.vibrate([0, 400, 200, 400]); // one strong buzz
    notifee.cancelAllNotifications().catch(() => {});
    if (profile?.id && profile?.couple_id) {
      getPartner(profile.id, profile.couple_id).then(setPartner);
    }
    return () => Vibration.cancel();
  }, [profile]);

  const finish = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  }, [navigation]);

  const confirm = async (confirmType, confirmMediaUrl) => {
    try {
      await confirmDose({
        coupleId: profile.couple_id,
        userId: profile.id,
        partnerId: partner?.id,
        partnerToken: partner?.expo_push_token,
        myName: profile.display_name,
        nudgeId: nudge.id,
        label: nudge.message,
        confirmType,
        confirmMediaUrl,
      });
      finish();
    } catch (e) {
      Alert.alert('Hmm', e.message ?? String(e));
      setMode('prompt');
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) { Alert.alert('Camera needed', 'Allow the camera to send a selfie.'); return; }
    }
    setMode('camera');
  };

  const snap = async () => {
    if (!cameraRef) return;
    setMode('saving');
    try {
      const photo = await cameraRef.takePictureAsync({ quality: 0.5, skipProcessing: true });
      const path = await uploadConfirmationSelfie(profile.couple_id, photo.uri);
      await confirm('selfie', path);
    } catch (e) {
      Alert.alert('Selfie failed', e.message ?? String(e));
      setMode('prompt');
    }
  };

  if (mode === 'camera') {
    return (
      <View style={styles.cameraWrap}>
        <CameraView ref={(r) => { cameraRef = r; }} style={styles.camera} facing="front" />
        <View style={styles.cameraControls}>
          <Text style={styles.cameraHint}>smile! this goes to {partner?.display_name ?? 'your love'} 💕</Text>
          <TouchableOpacity style={styles.shutter} onPress={snap} activeOpacity={0.8}>
            <Text style={styles.shutterLabel}>snap & send</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('prompt')}>
            <Text style={styles.cancelText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === 'saving') {
    return (
      <View style={styles.alarm}>
        <ActivityIndicator color={colors.white} size="large" />
        <Text style={styles.savingText}>sending your proof… 📸</Text>
      </View>
    );
  }

  return (
    <View style={styles.alarm}>
      <Text style={styles.kicker}>a nudge from {partner?.display_name ?? 'your love'} 💛</Text>
      <Text style={styles.message}>{nudge.message}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.tookBtn} onPress={() => confirm('swipe', null)} activeOpacity={0.85}>
          <Text style={styles.tookLabel}>i took it ✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selfieBtn} onPress={openCamera} activeOpacity={0.85}>
          <Text style={styles.selfieLabel}>📸 take a selfie to prove it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alarm: {
    flex: 1,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  kicker: {
    fontFamily: 'Nunito_300Light_Italic',
    fontSize: 20,
    color: colors.onCoral,
    marginBottom: 18,
    textAlign: 'center',
  },
  message: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 34,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 56,
  },
  actions: { width: '100%', gap: 14 },
  tookBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  tookLabel: { fontFamily: font.family, fontWeight: font.weights.extraBold, fontSize: 20, color: colors.coralDeep },
  selfieBtn: {
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selfieLabel: { fontFamily: font.family, fontWeight: font.weights.semiBold, fontSize: 16, color: colors.white },
  cameraWrap: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 32, alignItems: 'center', gap: 16,
  },
  cameraHint: {
    fontFamily: 'Nunito_300Light_Italic', fontSize: 16, color: colors.white, textAlign: 'center',
  },
  shutter: {
    backgroundColor: colors.coral, borderRadius: radius.pill,
    paddingVertical: 16, paddingHorizontal: 48,
  },
  shutterLabel: { fontFamily: font.family, fontWeight: font.weights.extraBold, fontSize: 18, color: colors.white },
  cancelText: { fontFamily: font.family, fontSize: 15, color: colors.white, opacity: 0.8 },
  savingText: { fontFamily: 'Nunito_300Light_Italic', fontSize: 18, color: colors.white, marginTop: 16 },
});
