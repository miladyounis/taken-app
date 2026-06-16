import notifee, {
  AndroidImportance, AndroidCategory, AndroidVisibility,
} from '@notifee/react-native';

let channelPromise = null;

export async function ensureAlarmChannel() {
  if (!channelPromise) {
    channelPromise = notifee.createChannel({
      id: 'alarm',
      name: 'Pill Alarms',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      bypassDnd: true,
      visibility: AndroidVisibility.PUBLIC,
    });
  }
  return channelPromise;
}

// Shows a full-screen-intent notification that takes over the (even locked) screen.
export async function displayFullScreenAlarm({ id, message }) {
  const channelId = await ensureAlarmChannel();
  await notifee.displayNotification({
    id: id ?? `alarm-${Date.now()}`,
    title: 'taken? 💊',
    body: message ?? 'did you take your pills, love?',
    data: { nudgeId: id ?? '', message: message ?? '' },
    android: {
      channelId,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      fullScreenAction: { id: 'default' },
      pressAction: { id: 'default', launchActivity: 'default' },
      autoCancel: true,
    },
  });
}
