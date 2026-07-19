import AsyncStorage from '@react-native-async-storage/async-storage';

// Free tier: 3 readings/day. Premium: 30-day full access (ported from tdt-ginni).
export const FREE_DAILY_LIMIT = 3;

const K_DATE = 'ginni.date';
const K_COUNT = 'ginni.count';
const K_PREM = 'ginni.premiumUntil';

const today = () => new Date().toISOString().slice(0, 10);

export async function isPremium() {
  const u = await AsyncStorage.getItem(K_PREM);
  return !!(u && Number(u) > Date.now());
}

export async function getUsage() {
  const premium = await isPremium();
  let used = 0;
  const d = await AsyncStorage.getItem(K_DATE);
  if (d === today()) used = Number(await AsyncStorage.getItem(K_COUNT)) || 0;
  return {
    used,
    remaining: premium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - used),
    premium,
  };
}

export async function canRead() {
  const { remaining, premium } = await getUsage();
  return premium || remaining > 0;
}

export async function recordReading() {
  if (await isPremium()) return;
  const d = await AsyncStorage.getItem(K_DATE);
  let used = d === today() ? Number(await AsyncStorage.getItem(K_COUNT)) || 0 : 0;
  used += 1;
  await AsyncStorage.setItem(K_DATE, today());
  await AsyncStorage.setItem(K_COUNT, String(used));
}

// Incubated: grants a 30-day full-access window immediately. When you have a
// real Razorpay subscription verified server-side, call this after verification.
export async function grantPremium(days = 30) {
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  await AsyncStorage.setItem(K_PREM, String(until));
  return until;
}
