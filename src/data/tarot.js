// Ginni Ki Baatein — tarot data (ported from github.com/devthedivinetarot/tdt-ginni)
// Full 78-card Rider–Waite deck (all upright), card art, question templates.

const MAJOR = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World',
];
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const RANKS = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Page', 'Knight', 'Queen', 'King',
];
const MINOR = SUITS.flatMap((suit) => RANKS.map((rank) => `${rank} of ${suit}`));

export const DECK = [...MAJOR, ...MINOR]; // 78 cards

// --- Card art (public-domain Rider–Waite–Smith from Wikimedia Commons) -----
const WIKI_MAJOR = {
  'The Fool': '00_Fool', 'The Magician': '01_Magician', 'The High Priestess': '02_High_Priestess',
  'The Empress': '03_Empress', 'The Emperor': '04_Emperor', 'The Hierophant': '05_Hierophant',
  'The Lovers': '06_Lovers', 'The Chariot': '07_Chariot', 'Strength': '08_Strength',
  'The Hermit': '09_Hermit', 'Wheel of Fortune': '10_Wheel_of_Fortune', 'Justice': '11_Justice',
  'The Hanged Man': '12_Hanged_Man', 'Death': '13_Death', 'Temperance': '14_Temperance',
  'The Devil': '15_Devil', 'The Tower': '16_Tower', 'The Star': '17_Star', 'The Moon': '18_Moon',
  'The Sun': '19_Sun', 'Judgement': '20_Judgement', 'The World': '21_World',
};
const SUIT_PREFIX = { Wands: 'Wands', Cups: 'Cups', Swords: 'Swords', Pentacles: 'Pents' };
const RANK_NUM = {
  Ace: '01', Two: '02', Three: '03', Four: '04', Five: '05', Six: '06', Seven: '07',
  Eight: '08', Nine: '09', Ten: '10', Page: '11', Knight: '12', Queen: '13', King: '14',
};
const WIKI_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

function wikiFile(name) {
  if (WIKI_MAJOR[name]) return `RWS_Tarot_${WIKI_MAJOR[name]}.jpg`;
  const m = name.match(/^(\w+) of (\w+)$/);
  if (m) {
    const num = RANK_NUM[m[1]];
    const suit = SUIT_PREFIX[m[2]];
    if (num && suit) return `${suit}${num}.jpg`;
  }
  return null;
}

export function cardImage(name) {
  const wf = wikiFile(name);
  return wf ? `${WIKI_BASE}${wf}?width=420` : '';
}

// Draw `n` unique cards — all UPRIGHT.
export function drawCards(n) {
  const pool = [...DECK];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [name] = pool.splice(idx, 1);
    out.push({ name });
  }
  return out;
}

export const TEMPLATES = [
  { emoji: '🪄', text: 'Yes / No reading' },
  { emoji: '🌅', text: 'Aaj ka din kaisa hoga' },
  { emoji: '💞', text: 'Aapka union kab hoga' },
  { emoji: '💍', text: 'Aapki shaadi kab hogi' },
  { emoji: '💖', text: 'Aapko life partner kab milega' },
  { emoji: '✨', text: 'Aapko soulmate kab milega' },
  { emoji: '👶', text: 'Aapko baby kab hoga' },
  { emoji: '💭', text: 'Partner current feelings' },
  { emoji: '🔮', text: 'Relationship past, present, future' },
  { emoji: '🌌', text: 'Universe guidance' },
];

export const welcomeMessage = (name) =>
  `Namaste ${name || 'seeker'}. 🌙 Main Ginni hoon. Ek gehri saans lijiye, aur jab aap tayyar hon, woh sawaal poochhiye jo aapke zehan mein chal raha hai. The cards will speak with the grace it deserves. 🔮`;
