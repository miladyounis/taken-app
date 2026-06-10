import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_KEY = '@taken_reminders';
const LOG_KEY = '@taken_log';

export async function getReminders() {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  return raw ? JSON.parse(raw) : getDefaultReminders();
}

export async function saveReminders(reminders) {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export async function logDose(reminderId, date = new Date()) {
  const raw = await AsyncStorage.getItem(LOG_KEY);
  const log = raw ? JSON.parse(raw) : {};
  const key = toDateKey(date);
  if (!log[key]) log[key] = [];
  if (!log[key].includes(reminderId)) log[key].push(reminderId);
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
}

export async function getTodayLog() {
  const raw = await AsyncStorage.getItem(LOG_KEY);
  const log = raw ? JSON.parse(raw) : {};
  return log[toDateKey(new Date())] || [];
}

export async function getStreak() {
  const raw = await AsyncStorage.getItem(LOG_KEY);
  const log = raw ? JSON.parse(raw) : {};
  const reminders = await getReminders();
  const activeIds = reminders.filter((r) => r.enabled).map((r) => r.id);
  if (activeIds.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const taken = log[key] || [];
    const allTaken = activeIds.every((id) => taken.includes(id));
    if (allTaken) streak++;
    else break;
  }
  return streak;
}

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

function getDefaultReminders() {
  return [
    {
      id: 'morning',
      label: 'Morning pills',
      hour: 9,
      minute: 0,
      enabled: true,
      message: 'good morning, love ☀️ time for your morning pills!',
    },
    {
      id: 'evening',
      label: 'Evening pills',
      hour: 21,
      minute: 0,
      enabled: true,
      message: 'hey love 🌙 don\'t forget your evening pills!',
    },
  ];
}
