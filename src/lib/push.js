import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// True only inside Expo Go, where remote push isn't supported.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Sends a push notification to a given Expo push token via Expo's push service.
// Best-effort: never throws (a failed push shouldn't break the nudge being saved).
export async function sendPush(toToken, title, body, data = {}) {
  if (!toToken) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toToken,
        title,
        body,
        sound: 'default',
        channelId: 'pill-reminders',
        priority: 'high',
        data,
      }),
    });
  } catch (e) {
    console.log('[push] sendPush failed:', e?.message ?? String(e));
  }
}

// Registers this device for push and saves the token to the user's profile.
// No-ops in Expo Go (push needs a development/production build).
export async function registerPushToken(userId) {
  if (isExpoGo) { console.log('[push] skipped: running in Expo Go'); return null; }
  if (!Device.isDevice) { console.log('[push] skipped: not a physical device'); return null; }
  if (!userId) { console.log('[push] skipped: no userId'); return null; }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') { console.log('[push] permission not granted:', status); return null; }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pill-reminders', {
      name: 'Pill Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F58A7E',
    });
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) { console.log('[push] no projectId in config'); return null; }
  console.log('[push] requesting token for projectId:', projectId);

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[push] got token:', token);
    if (token) {
      const { error } = await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
      if (error) console.log('[push] DB save error:', error.message);
      else console.log('[push] token saved to profile');
    }
    return token;
  } catch (e) {
    console.log('[push] getExpoPushTokenAsync FAILED:', e?.message ?? String(e));
    return null;
  }
}
