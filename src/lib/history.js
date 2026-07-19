import AsyncStorage from '@react-native-async-storage/async-storage';

// Local reading history (last 50 readings), stored on-device.
const KEY = 'reading.history';

export async function saveReading(entry) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ id: Date.now().toString(36), at: Date.now(), ...entry });
    const trimmed = list.slice(0, 50);
    await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (e) { return []; }
}

export async function getHistory() {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}

export async function clearHistory() {
  try { await AsyncStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}
