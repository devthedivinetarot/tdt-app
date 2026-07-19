// Ginni Reading Engine — deterministic, document-grounded (ported native).
// Free-text question → ONE of 15 intents → draw card(s) → reading text pulled
// VERBATIM from the bundled knowledge base. NO LLM, fully offline.
//
// Only `universe_guidance` is bundled today (covers all 78 cards), so every
// intent resolves via its fallback. Drop more topic JSON files into
// ../data/ginni-kb/ and register them in KB below for fuller fidelity.

import AsyncStorage from '@react-native-async-storage/async-storage';

// Knowledge base (verbatim from tdt-ginni/app/public/ginni-kb).
// Whatever is bundled in src/data/ginni-kb/index.js is used offline; any topic
// not yet bundled is fetched from the repo on first use and cached to disk.
// Run `node scripts/fetch-kb.mjs` once to bundle ALL 13 files for full offline.
import BUNDLED from '../data/ginni-kb';

const KB = { ...BUNDLED };

const RAW_BASE = 'https://raw.githubusercontent.com/devthedivinetarot/tdt-ginni/main/app/public/ginni-kb/';
const _pending = {};

// Ensure a topic file is in KB (bundled → cached → fetched → {} fallback).
async function ensureFile(file) {
  if (KB[file]) return KB[file];
  if (_pending[file]) return _pending[file];
  _pending[file] = (async () => {
    try {
      const cached = await AsyncStorage.getItem('ginni.kb.' + file);
      if (cached) { KB[file] = JSON.parse(cached); return KB[file]; }
    } catch (e) { /* ignore */ }
    try {
      const res = await fetch(RAW_BASE + file + '.json');
      if (res.ok) {
        const data = await res.json();
        KB[file] = data;
        try { await AsyncStorage.setItem('ginni.kb.' + file, JSON.stringify(data)); } catch (e) { /* ignore */ }
        return data;
      }
    } catch (e) { /* ignore */ }
    KB[file] = {}; // fetch failed → fall back to universe_guidance
    return KB[file];
  })();
  const out = await _pending[file];
  delete _pending[file];
  return out;
}

// Preload a topic's file (+ the fallback) before a reading is revealed.
export async function preloadTopic(topicKey) {
  const meta = topicMeta(topicKey);
  await ensureFile(meta.file);
  await ensureFile('universe_guidance');
}

const MAJORS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
];
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
export const DECK = [...MAJORS, ...SUITS.flatMap((s) => RANKS.map((r) => `${r} of ${s}`))];

export const TOPICS = [
  { key: 'yes_no_guidance', label: 'Yes / No (with guidance)', file: 'yes_no', count: 1, mode: 'yesno' },
  { key: 'yes_no_direct', label: 'Yes / No (direct)', file: 'yes_no', count: 1, mode: 'yesno_verdict' },
  { key: 'daily', label: 'Aaj ka din kaisa hoga', file: 'daily', count: 1 },
  { key: 'union', label: 'Union — kab hoga', file: 'union', count: 1 },
  { key: 'third_party_end', label: 'Third-party situation — kab end hogi', file: 'third_party_end', count: 1 },
  { key: 'shaadi', label: 'Shaadi — kab hogi', file: 'shaadi', count: 1 },
  { key: 'life_partner', label: 'Life partner — kab milega', file: 'life_partner', count: 1 },
  { key: 'baby', label: 'Baby — kab hoga', file: 'baby', count: 1 },
  { key: 'soulmate', label: 'Soulmate — kab milega', file: 'soulmate', count: 1 },
  { key: 'partner_feelings', label: "Partner's current feelings", file: 'partner_feelings', count: 1 },
  { key: 'connection', label: 'Spiritual journey', file: 'connection', count: 1 },
  { key: 'monthly', label: 'Monthly prediction', file: 'monthly', count: 1 },
  { key: 'universe_guidance', label: 'Universe guidance', file: 'universe_guidance', count: 1 },
  { key: 'partner_action', label: "Partner's action", file: 'partner_action', count: 1 },
  { key: 'relationship_ppf', label: 'Relationship — Past / Present / Future', file: 'relationship_ppf', count: 3 },
];
const TOPIC_BY_KEY = Object.fromEntries(TOPICS.map((t) => [t.key, t]));
export function topicMeta(key) { return TOPIC_BY_KEY[key] || TOPIC_BY_KEY.universe_guidance; }
export function cardCountFor(key) { return topicMeta(key).count || 1; }

const _CLASSIFY = [
  ['daily', /aaj ka din|\btoday\b|din kaisa|aaj kaisa/i],
  ['third_party_end', /third[\s-]?party|affair|interfere|interference|teesr/i],
  ['baby', /\bbaby\b|pregnan|conceive|bach(?:a|cha)|santaan|aulad|garbh/i],
  ['shaadi', /shaadi|marriage|married|vivah|byah/i],
  ['soulmate', /soulmate/i],
  ['union', /\bunion\b|milan|reunion|wapas|come ?back|reunite/i],
  ['life_partner', /life ?partner|jeevansa?thi|partner kab|kab milega.*partner|pyaa?r kab|kab.*pyaa?r|love kab|sacha pyaa?r|mera partner|apna partner|kisi se pyaa?r/i],
  ['connection', /twin ?flame|karmic|spiritual journey|connection type|kis tarah ka connection/i],
  ['monthly', /month|mahin|is mahine|career|studies|forecast/i],
  ['partner_feelings', /feel|feeling|soch|dil mein|mann mein|kya sochta|kya soch rah/i],
  ['partner_action', /action|kya kareg|next move|contact kareg|reach out|wapas aayega/i],
  ['relationship_ppf', /past.*present.*future|relationship status|relationship dynamic|\bppf\b|risht|relationship/i],
  ['yes_no_guidance', /yes ?\/? ?no|haan ya nahi|will i|should i|kya .* hoga\??/i],
  ['universe_guidance', /guidance|universe|advice|margdarshan|message/i],
];
export function classifyTopic(text) {
  const t = (text || '').toLowerCase();
  for (const [key, re] of _CLASSIFY) if (re.test(t)) return key;
  return 'universe_guidance';
}

function loadFile(file) { return KB[file] || {}; }

function yesnoParse(raw) {
  const m = raw.match(/[–—-]\s*(.*?)\s*GUID[EI]ANCE\s*[-–—]?\s*([\s\S]*)$/i);
  if (!m) return { verdict: raw, guidance: '' };
  return { verdict: m[1].trim(), guidance: m[2].trim() };
}

function cleanArtifacts(s) {
  return s.split('\n').filter((l) => !/^\s*(top|bottom)\s+of\s+(the\s+)?form\s*$/i.test(l)).join('\n').trim();
}

const LANG_LABEL = '(Hinglish|English|Hindi\\w*|हिंदी|हिन्दी|हिंग्लिश|हिंगलिश|इंग्लिश)';
const langLabelRe = () => new RegExp('(^|\\n)[ \\t]*' + LANG_LABEL + '[ \\t]*(?::|(?=\\r?\\n)|$)', 'gi');
function langKey(lab) {
  const l = (lab || '').toLowerCase();
  if (l.startsWith('hinglish') || /हिंग/.test(lab)) return 'hinglish';
  if (l.startsWith('hindi') || /हिंदी|हिन्दी/.test(lab)) return 'hindi';
  return 'english';
}
export function extractLanguage(raw, lang = 'hinglish') {
  const s = cleanArtifacts(raw || '');
  const ms = [...s.matchAll(langLabelRe())];
  if (!ms.length) return s;
  const blocks = {};
  for (let i = 0; i < ms.length; i++) {
    const key = langKey(ms[i][2]);
    const start = ms[i].index + ms[i][0].length;
    const end = i + 1 < ms.length ? ms[i + 1].index : s.length;
    blocks[key] = (s.slice(start, end).trim() || blocks[key] || '');
  }
  const want = (lang || 'hinglish').toLowerCase();
  return blocks[want] || blocks.hinglish || blocks.english || Object.values(blocks)[0] || s;
}

// Grounded reading for one card under one intent (falls back to Universe Guidance).
export function getReadingByCard(topicKey, cardName, lang = 'hinglish') {
  if (!cardName) return { card: '', topic: topicKey, text: '', fallback: true };
  const meta = topicMeta(topicKey);
  let raw = (loadFile(meta.file)[cardName] || '').trim();
  let fallback = false;

  if (!raw) {
    fallback = true;
    raw = (loadFile('universe_guidance')[cardName] || '').trim();
  }
  if (!raw) {
    return { card: cardName, topic: topicKey, text: `Is card (${cardName}) ki reading abhi available nahi hai — ek aur card draw kijiye. ✨`, fallback: true };
  }

  let text;
  if (!fallback && meta.mode === 'yesno') {
    const { verdict, guidance } = yesnoParse(raw);
    text = guidance ? `${verdict} — ${guidance}` : verdict;
  } else if (!fallback && meta.mode === 'yesno_verdict') {
    text = yesnoParse(raw).verdict;
  } else {
    text = extractLanguage(raw, lang);
  }
  return { card: cardName, topic: topicKey, text, fallback };
}
