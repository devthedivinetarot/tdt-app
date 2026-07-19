import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

import PressableScale from './PressableScale';
import CardBack from './CardBack';
import CardPicker from './CardPicker';
import AmbientStars from './AmbientStars';
import HistoryModal from './HistoryModal';
import SubscriptionModal from './SubscriptionModal';
import { useAuth } from '../context/AuthContext';
import { cardImage, TEMPLATES, welcomeMessage } from '../data/tarot';
import { classifyTopic, topicMeta, cardCountFor, getReadingByCard, preloadTopic } from '../lib/readingEngine';
import { canRead, recordReading, getUsage } from '../lib/rateLimit';
import { saveReading } from '../lib/history';
import { success } from '../lib/haptics';
import { colors, spacing, radius, font, serif } from '../theme';

const PPF = ['Past', 'Present', 'Future'];
const uid = () => Math.random().toString(36).slice(2);

function CardArt({ name }) {
  const [failed, setFailed] = useState(false);
  if (failed || !cardImage(name)) {
    return <View style={[styles.cardImg, styles.cardFallback]}><Text style={styles.cardFallbackText}>{name}</Text></View>;
  }
  return <Image source={{ uri: cardImage(name) }} style={styles.cardImg} resizeMode="cover" onError={() => setFailed(true)} />;
}

// Flips from the mystic back to the face-up card art once, staggered per card.
function FlipCard({ name, delay = 0 }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(delay, withTiming(1, { duration: 620 })); }, []); // eslint-disable-line
  const back = useAnimatedStyle(() => ({
    opacity: p.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 700 }, { rotateY: `${p.value * 180}deg` }],
  }));
  const front = useAnimatedStyle(() => ({
    opacity: p.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 700 }, { rotateY: `${p.value * 180 - 180}deg` }],
  }));
  return (
    <View style={styles.cardImg}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flipFace, back]}>
        <CardBack style={StyleSheet.absoluteFill} moon={22} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flipFace, front]}>
        <CardArt name={name} />
      </Animated.View>
    </View>
  );
}

export default function GinniChat() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const [name, setName] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [picker, setPicker] = useState(null);     // { topic, count, label }
  const [subVisible, setSubVisible] = useState(false);
  const [histVisible, setHistVisible] = useState(false);
  const [usage, setUsage] = useState({ remaining: 3, premium: false });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('ginni.name');
      const n = saved || (user && user.name) || '';
      setName(n);
      if (n) setMessages([{ id: uid(), role: 'ginni', text: welcomeMessage(n) }]);
      setUsage(await getUsage());
    })();
  }, []);

  const scrollDown = () => requestAnimationFrame(() => scrollRef.current && scrollRef.current.scrollToEnd({ animated: true }));

  const enter = async () => {
    const n = nameInput.trim();
    if (!n) return;
    await AsyncStorage.setItem('ginni.name', n);
    setName(n);
    setMessages([{ id: uid(), role: 'ginni', text: welcomeMessage(n) }]);
    setUsage(await getUsage());
  };

  const ask = async (question) => {
    const q = (question || '').trim();
    if (!q || picker) return;
    setInput('');
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: q }]);
    scrollDown();

    if (!(await canRead())) { setSubVisible(true); return; }
    const topic = classifyTopic(q);
    preloadTopic(topic); // fetch/cache the topic's KB file while the user picks
    setPicker({ topic, count: cardCountFor(topic), label: topicMeta(topic).label });
  };

  // Card picker finished → build the reading, charge one, refresh usage.
  const reveal = async (cards) => {
    const topic = picker.topic;
    const label = picker.label;
    await preloadTopic(topic); // guarantee the topic file is loaded before reveal
    const built = cards.map((c, i) => ({
      ...getReadingByCard(topic, c),
      position: cards.length === 3 ? PPF[i] : null,
    }));
    setPicker(null);
    setMessages((prev) => [...prev, { id: uid(), role: 'reading', topicLabel: label, cards: built }]);
    success();
    await recordReading();
    await saveReading({ topicLabel: label, cards: built.map((c) => ({ card: c.card, position: c.position, text: c.text })) });
    setUsage(await getUsage());
    scrollDown();
  };

  // ---- Onboarding ----
  if (name === null) return <View style={[styles.root, styles.center]}><ActivityIndicator color={colors.gold} /></View>;
  if (!name) {
    return (
      <View style={[styles.root, styles.center, { padding: spacing.xl }]}>
        <AmbientStars count={20} />
        <View style={styles.moon}><Ionicons name="moon" size={30} color={colors.gold} /></View>
        <Text style={styles.title}>Ginni Ki Baatein</Text>
        <Text style={styles.sub}>Enter the sanctum. Apna naam bataiye taaki main aapke liye cards nikaal sakoon.</Text>
        <TextInput style={styles.nameInput} value={nameInput} onChangeText={setNameInput} placeholder="Aapka naam" placeholderTextColor={colors.textMuted} onSubmitEditing={enter} returnKeyType="done" />
        <PressableScale to={0.96} onPress={enter} style={styles.enterBtn}><Text style={styles.enterText}>Enter the Sanctum ✨</Text></PressableScale>
      </View>
    );
  }

  const remainingLabel = usage.premium ? '✨ Premium · unlimited readings' : `${usage.remaining} free reading${usage.remaining === 1 ? '' : 's'} remaining`;

  // ---- Chat ----
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AmbientStars count={20} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.moonSm}><Ionicons name="moon" size={18} color={colors.gold} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hName}>Ginni</Text>
          <Text style={styles.hStatus}>In session · The deck is prepared ✨</Text>
        </View>
        <PressableScale to={0.9} onPress={() => setHistVisible(true)} style={styles.histBtn} hitSlop={8}>
          <Ionicons name="time-outline" size={20} color={colors.gold} />
        </PressableScale>
        <View style={styles.pill}><Text style={styles.pillText}>{remainingLabel}</Text></View>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.lg }} onContentSizeChange={scrollDown} showsVerticalScrollIndicator={false}>
        {messages.map((m) => {
          if (m.role === 'user') return <View key={m.id} style={[styles.bubble, styles.userBubble]}><Text style={styles.userText}>{m.text}</Text></View>;
          if (m.role === 'ginni') return <View key={m.id} style={[styles.bubble, styles.ginniBubble]}><Text style={styles.ginniText}>{m.text}</Text></View>;
          return (
            <View key={m.id} style={[styles.bubble, styles.ginniBubble, styles.readingBubble]}>
              <Text style={styles.topicLabel}>✨ {m.topicLabel}</Text>
              {m.cards.map((c, i) => (
                <View key={i} style={styles.cardRow}>
                  <FlipCard name={c.card} delay={i * 170} />
                  <View style={styles.cardInfo}>
                    {c.position ? <Text style={styles.pos}>{c.position}</Text> : null}
                    <Text style={styles.cardName}>{c.card}</Text>
                    <Text style={styles.readingText}>{c.text}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.blessing}>🌙 For guidance purposes only</Text>
            </View>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tpls} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        {TEMPLATES.map((t) => (
          <PressableScale key={t.text} to={0.95} onPress={() => ask(t.text)} style={styles.chip}>
            <Text style={styles.chipText}>{t.emoji} {t.text}</Text>
          </PressableScale>
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 8) + 92 }]}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Apna sawaal likhiye…" placeholderTextColor={colors.textMuted} onSubmitEditing={() => ask(input)} returnKeyType="send" />
        <PressableScale to={0.9} onPress={() => ask(input)} style={[styles.draw, !input.trim() && { opacity: 0.5 }]}>
          <Text style={styles.drawText}>Draw</Text>
        </PressableScale>
      </View>

      {/* Card picker overlay */}
      {picker ? (
        <CardPicker count={picker.count} topicLabel={picker.label} onDone={reveal} onCancel={() => setPicker(null)} />
      ) : null}

      {/* Subscription gate */}
      <SubscriptionModal
        visible={subVisible}
        onClose={() => setSubVisible(false)}
        onSubscribed={async () => { setSubVisible(false); setUsage(await getUsage()); }}
      />

      {/* Reading history */}
      <HistoryModal visible={histVisible} onClose={() => setHistVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  center: { alignItems: 'center', justifyContent: 'center' },

  moon: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { color: colors.text, fontFamily: serif, fontSize: font.h1, fontWeight: '700', textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  nameInput: { alignSelf: 'stretch', backgroundColor: colors.bgCardSolid, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: font.body, marginTop: spacing.xl },
  enterBtn: { alignSelf: 'stretch', backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: 13, alignItems: 'center', marginTop: spacing.md },
  enterText: { color: '#1a1206', fontWeight: '800', fontSize: font.body },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  moonSm: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  hName: { color: colors.gold, fontFamily: serif, fontSize: font.h3, fontWeight: '700' },
  hStatus: { color: colors.textMuted, fontSize: font.tiny },
  histBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard },
  pill: { backgroundColor: colors.bgCard, borderColor: colors.glassBorder, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, maxWidth: 120 },
  pillText: { color: colors.gold, fontSize: font.tiny, fontWeight: '700', textAlign: 'center' },

  bubble: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: 'rgba(233,196,106,0.14)', borderWidth: 1, borderColor: 'rgba(233,196,106,0.3)' },
  userText: { color: colors.text, fontSize: font.body },
  ginniBubble: { alignSelf: 'flex-start', backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  ginniText: { color: colors.text, fontSize: font.body, lineHeight: 22 },

  // Readings need full width so the card + text don't collapse into a sliver.
  readingBubble: { alignSelf: 'stretch', maxWidth: '100%' },

  topicLabel: { color: colors.gold, fontWeight: '800', fontSize: font.small, marginBottom: spacing.sm, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, alignItems: 'flex-start' },
  cardInfo: { flex: 1, minWidth: 0 },
  cardImg: { width: 74, height: 124, borderRadius: radius.sm, backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.glassBorder },
  flipFace: { borderRadius: radius.sm, overflow: 'hidden', backfaceVisibility: 'hidden' },
  cardFallback: { alignItems: 'center', justifyContent: 'center', padding: 4 },
  cardFallbackText: { color: colors.gold, fontSize: font.tiny, textAlign: 'center', fontWeight: '700' },
  pos: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1 },
  cardName: { color: colors.gold, fontFamily: serif, fontSize: font.h3, fontWeight: '700', flexShrink: 1 },
  readingText: { color: colors.text, fontSize: font.small, lineHeight: 20, marginTop: 4 },
  blessing: { color: colors.textMuted, fontSize: font.tiny, marginTop: 2 },

  tpls: { maxHeight: 44, flexGrow: 0 },
  chip: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { color: colors.text, fontSize: font.small },

  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  input: { flex: 1, backgroundColor: colors.bgCardSolid, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: font.body },
  draw: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 11 },
  drawText: { color: '#1a1206', fontWeight: '800', fontSize: font.body },
});
