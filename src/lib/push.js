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

// Registers this device for push and saves the token to the user's profile.
// No-ops in Expo Go (push needs a development/production build).
export async function registerPushToken(userId) {
  if (isExpoGo || !Device.isDevice || !userId) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

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
  if (!projectId) return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  if (token) {
    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
  }
  return token;
}
