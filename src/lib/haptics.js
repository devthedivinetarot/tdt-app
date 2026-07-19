import { Platform } from 'react-native';

// Cross-platform haptics. No-ops on web and degrades gracefully if the native
// module isn't installed yet (require is wrapped so Metro never hard-crashes).
let H = null;
if (Platform.OS !== 'web') {
  try { H = require('expo-haptics'); } catch (e) { H = null; }
}

const safe = (fn) => { try { fn(); } catch (e) { /* ignore */ } };

export const tap = () => H && safe(() => H.impactAsync(H.ImpactFeedbackStyle.Light));
export const medium = () => H && safe(() => H.impactAsync(H.ImpactFeedbackStyle.Medium));
export const heavy = () => H && safe(() => H.impactAsync(H.ImpactFeedbackStyle.Heavy));
export const select = () => H && safe(() => H.selectionAsync());
export const success = () => H && safe(() => H.notificationAsync(H.NotificationFeedbackType.Success));
