import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pill-reminders', {
      name: 'Pill Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F58A7E',
      sound: true,
    });
  }

  return finalStatus;
}

export async function scheduleLocalReminder({ id, title, body, hour, minute, repeats = true }) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
      data: { reminderId: id },
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
      repeats,
      channelId: 'pill-reminders',
    },
  });
}

export async function cancelReminder(id) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function getAllScheduled() {
  return Notifications.getAllScheduledNotificationsAsync();
}
