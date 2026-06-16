import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import notifee, { EventType } from '@notifee/react-native';
import { navigate } from './navigation';
import { displayFullScreenAlarm } from './alarm';

function nudgeFromExpo(notification) {
  const data = notification?.request?.content?.data ?? {};
  const message = notification?.request?.content?.body ?? data.message ?? '';
  return { id: data.nudgeId || null, message };
}

// Wires every way a nudge can arrive to the full-screen Alarm screen.
export function useNotificationRouting() {
  useEffect(() => {
    // Foreground remote push: take over now if app is open, else fire full-screen intent.
    const sub1 = Notifications.addNotificationReceivedListener((notification) => {
      const nudge = nudgeFromExpo(notification);
      if (AppState.currentState === 'active') {
        navigate('Alarm', { nudge });
      } else {
        displayFullScreenAlarm(nudge);
      }
    });

    // User tapped the system notification.
    const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
      navigate('Alarm', { nudge: nudgeFromExpo(response.notification) });
    });

    // User tapped the notifee full-screen alarm.
    const unsubFg = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const d = detail.notification?.data ?? {};
        navigate('Alarm', { nudge: { id: d.nudgeId || null, message: d.message || '' } });
      }
    });

    // Cold start from tapping a notification.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) navigate('Alarm', { nudge: nudgeFromExpo(response.notification) });
    });

    return () => {
      sub1.remove();
      sub2.remove();
      unsubFg();
    };
  }, []);
}
