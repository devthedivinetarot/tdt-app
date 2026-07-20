import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, getReadingsRemote, setReadingsRemote } from '../authBackend';

// Reading history: stored on-device AND (when signed in) synced to Firestore
// under the user's doc, so it follows the user across devices.
const KEY = 'reading.history';
const LOCAL_CAP = 50;
const REMOTE_CAP = 30; // keep the synced copy small (Firestore doc size limit)

const dedupe = (arr) => {
  const seen = new Set(); const out = [];
  for (const r of arr) { if (r && r.id && !seen.has(r.id)) { seen.add(r.id); out.push(r); } }
  return out;
};
const byNewest = (a, b) => (b.at || 0) - (a.at || 0);

async function localGet() {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}
async function localSet(list) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}
function uid() { try { const u = getCurrentUser(); return u && u.uid; } catch (e) { return null; } }

export async function saveReading(entry) {
  const item = { id: Date.now().toString(36), at: Date.now(), ...entry };
  const local = await localGet();
  const nextLocal = dedupe([item, ...local]).slice(0, LOCAL_CAP);
  await localSet(nextLocal);

  const id = uid();
  if (id) {
    try {
      const remote = await getReadingsRemote(id);
      const merged = dedupe([item, ...remote]).sort(byNewest).slice(0, REMOTE_CAP);
      await setReadingsRemote(id, merged);
    } catch (e) { /* offline / rules — local copy still saved */ }
  }
  return nextLocal;
}

export async function getHistory() {
  const local = await localGet();
  const id = uid();
  if (id) {
    try {
      const remote = await getReadingsRemote(id);
      const merged = dedupe([...remote, ...local]).sort(byNewest).slice(0, LOCAL_CAP);
      await localSet(merged); // keep this device in sync
      return merged;
    } catch (e) { return local; }
  }
  return local;
}

export async function clearHistory() {
  try { await AsyncStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  const id = uid();
  if (id) { try { await setReadingsRemote(id, []); } catch (e) { /* ignore */ } }
}
