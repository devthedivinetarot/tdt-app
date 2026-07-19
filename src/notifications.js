import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Daily tarot reminders — Zomato / Astro style nudges that pull people back in.
// Uses LOCAL scheduled notifications (no push server needed; works in Expo Go
// on a real device). Tapping a reminder opens the in-app reading bot.
// ---------------------------------------------------------------------------

// Hinglish message bank (from the brand's reminder copy).
export const REMINDERS = [
  {
    title: '✨ Aaj ki energy kuch khaas keh rahi hai...',
    body: 'Ho sakta hai Universe ke paas aaj tumhare liye woh jawab ho jiska tum kaafi time se intezaar kar rahe ho. 👉 Apni cards choose karo.',
  },
  {
    title: '✨ Aaj Universe tumse kuch kehna chahta hai...',
    body: 'Bas 3 Tarot cards choose karo aur dekho aaj tumhare liye kya message aaya hai. 🔮 Your guidance is waiting.',
  },
  {
    title: '🌙 Har din ki energy alag hoti hai',
    body: 'Aaj ke Tarot messages miss mat karo. 🃏 3 cards choose karo aur apna answer dekho.',
  },
  {
    title: '❤️ Kya woh tumhare baare mein soch raha/rahi hai?',
    body: 'Aaj ke Tarot cards shayad tumhe wahi answer de dein jo tum dhoond rahe ho. 🃏 Apni cards choose karo.',
  },
];

// When each daily reminder fires.
const SLOTS = [
  { hour: 9, minute: 0 },   // morning
  { hour: 14, minute: 0 },  // afternoon
  { hour: 20, minute: 0 },  // evening
];

// Show the banner even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-tarot', {
      name: 'Daily Tarot Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#e9c46a',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function requestPermission() {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Schedule the daily reminders (rotating through the message bank per slot).
export async function scheduleDailyReminders() {
  if (Platform.OS === 'web') return false;
  await ensureAndroidChannel();
  const ok = await requestPermission();
  if (!ok) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (let i = 0; i < SLOTS.length; i++) {
    const msg = REMINDERS[i % REMINDERS.length];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        data: { route: '/reading' },
        sound: true,
      },
      trigger: {
        hour: SLOTS[i].hour,
        minute: SLOTS[i].minute,
        repeats: true,
        channelId: 'daily-tarot',
      },
    });
  }
  return true;
}

export async function cancelDailyReminders() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Fire a sample reminder in a few seconds so the user can preview it.
export async function previewReminder() {
  if (Platform.OS === 'web') return false;
  await ensureAndroidChannel();
  const ok = await requestPermission();
  if (!ok) return false;
  const msg = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
  await Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body, data: { route: '/reading' }, sound: true },
    trigger: { seconds: 3, channelId: 'daily-tarot' },
  });
  return true;
}
