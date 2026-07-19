// Brand theme for The Divine Tarot — matched to thedivinetarotonline.com
// Near-black background, GOLD primary accent, serif headings, warm coral->gold CTA.
// Deep violet appears ONLY in the "Cards Ka Message" panel.
import { Platform } from 'react-native';

export const colors = {
  gold: '#e9c46a',
  goldBright: '#f5c542',
  goldDeep: '#c99a3a',
  coral: '#f6604d',

  bg: '#0b0710',           // near-black, faint warm/purple
  bgDeep: '#070409',
  bgCard: 'rgba(255,255,255,0.035)',
  bgCardSolid: '#161019',
  border: 'rgba(255,255,255,0.09)',

  // Cards-ka-message panel (the one purple area on the site)
  panel: '#231143',
  panelBorder: 'rgba(180,140,255,0.28)',

  // Frosted glass tab bar
  glass: 'rgba(14,9,20,0.62)',
  glassBorder: 'rgba(233,196,106,0.22)',

  text: '#f7f2e7',         // warm white
  textMuted: '#9c9284',    // warm gray subtext
  star: '#f5c542',
  ratingPink: '#f6817a',
};

export const gradients = {
  screen: ['#070409', '#0b0710', '#0a0610'],
  cta: ['#f0912f', '#f6cf72'],      // warm gold CTA
  ctaHover: ['#f6604d', '#f6cf72'], // coral -> gold
  panel: ['#2a1348', '#3a1c5e', '#1c1030'], // purple cards panel
  gold: ['#e9c46a', '#f5deb3'],
};

// Serif for headings (system serif — no font files needed to run).
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };
export const font = { display: 34, h1: 28, h2: 22, h3: 18, body: 16, small: 13, tiny: 11 };

// Cross-platform shadow: uses `boxShadow` on web (avoids the deprecated
// "shadow*" prop warnings) and native shadow props on iOS/Android.
export const IS_WEB = Platform.OS === 'web';

function hexToRgb(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function shadow({ color = '#000000', opacity = 0.3, radius = 10, x = 0, y = 6, elevation = 8 } = {}) {
  if (IS_WEB) {
    return { boxShadow: `${x}px ${y}px ${radius}px rgba(${hexToRgb(color)},${opacity})` };
  }
  return { shadowColor: color, shadowOpacity: opacity, shadowRadius: radius, shadowOffset: { width: x, height: y }, elevation };
}
