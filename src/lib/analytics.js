import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Session logging → Google Sheet (via a Google Apps Script Web App).
//
// PASTE your deployed Apps Script Web App URL below. Until it's set, logging is
// a no-op (nothing is sent). Deployment steps are in ANALYTICS_SETUP.md.
// ---------------------------------------------------------------------------
export const LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzZVkylEw5AzjF7VRNBGs20mBo8NNY0fwzDbPCC90nYBIgKUBXbvUBar77Ka4GVrNmJ/exec'; // e.g. 'https://script.google.com/macros/s/XXXX/exec'

// Native modules are optional — require() is guarded so the app runs even
// before `npm install` pulls expo-device / expo-location / expo-application.
let Device = null, Location = null, Application = null, Crypto = null;
if (Platform.OS !== 'web') {
  try { Device = require('expo-device'); } catch (e) { }
  try { Location = require('expo-location'); } catch (e) { }
  try { Application = require('expo-application'); } catch (e) { }
}
try { Crypto = require('expo-crypto'); } catch (e) { }

const OPTOUT_KEY = 'analytics.optout';
const LOC_KEY = 'analytics.location';
const ID_KEY = 'analytics.installId';

async function installId() {
  try {
    let id = await AsyncStorage.getItem(ID_KEY);
    if (!id) {
      id = (Crypto && Crypto.randomUUID && Crypto.randomUUID()) ||
        (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      await AsyncStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch (e) { return 'unknown'; }
}

export async function isOptedOut() {
  try { return (await AsyncStorage.getItem(OPTOUT_KEY)) === '1'; } catch (e) { return false; }
}
export async function setOptOut(v) {
  try { await AsyncStorage.setItem(OPTOUT_KEY, v ? '1' : '0'); } catch (e) { }
}

export async function isLocationEnabled() {
  try { return (await AsyncStorage.getItem(LOC_KEY)) === '1'; } catch (e) { return false; }
}

// Ask OS permission for location (the real consent). Call from a Profile toggle.
export async function enableLocationLogging() {
  if (!Location) return false;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const ok = status === 'granted';
    await AsyncStorage.setItem(LOC_KEY, ok ? '1' : '0');
    if (ok) logSession(); // capture immediately
    return ok;
  } catch (e) { return false; }
}
export async function disableLocationLogging() {
  try { await AsyncStorage.setItem(LOC_KEY, '0'); } catch (e) { }
}

function currentUser() {
  try {
    const { getCurrentUser } = require('../authBackend');
    const u = getCurrentUser();
    if (!u) return {};
    return { uid: u.uid, name: u.displayName || '', email: u.email || '', phone: u.phoneNumber || '' };
  } catch (e) { return {}; }
}

async function getLocation() {
  if (!Location) return {};
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== 'granted') return {};
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const out = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: out.lat, longitude: out.lng });
      if (geo && geo[0]) {
        out.city = geo[0].city || geo[0].subregion || '';
        out.region = geo[0].region || '';
        out.country = geo[0].country || '';
      }
    } catch (e) { }
    return out;
  } catch (e) { return {}; }
}

// Fire-and-forget: builds a payload and POSTs it to the sheet endpoint.
export async function logSession(extra = {}) {
  try {
    if (!LOG_ENDPOINT) return;               // not configured yet
    if (await isOptedOut()) return;          // user opted out

    const id = await installId();
    const user = currentUser();
    const locOn = await isLocationEnabled();
    const loc = locOn ? await getLocation() : {};

    const payload = {
      ts: new Date().toISOString(),
      installId: id,
      platform: Platform.OS,
      // user
      uid: user.uid || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      // device
      brand: (Device && Device.brand) || '',
      manufacturer: (Device && Device.manufacturer) || '',
      model: (Device && (Device.modelName || Device.deviceName)) || (Platform.OS === 'web' ? 'Web browser' : ''),
      osName: (Device && Device.osName) || Platform.OS,
      osVersion: (Device && Device.osVersion) || String(Platform.Version || ''),
      appVersion: (Application && Application.nativeApplicationVersion) || '',
      build: (Application && Application.nativeBuildVersion) || '',
      // location (only if enabled + permitted)
      lat: loc.lat != null ? String(loc.lat) : '',
      lng: loc.lng != null ? String(loc.lng) : '',
      city: loc.city || '',
      region: loc.region || '',
      country: loc.country || '',
      ...extra,
    };

    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
      body: JSON.stringify(payload),
    });
  } catch (e) { /* never let logging break the app */ }
}
