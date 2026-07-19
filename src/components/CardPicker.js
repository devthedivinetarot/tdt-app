import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import PressableScale from './PressableScale';
import CardBack from './CardBack';
import AmbientStars from './AmbientStars';
import { DECK } from '../data/tarot';
import { colors, spacing, radius, font, serif, shadow } from '../theme';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function positionsFor(count) {
  if (count === 3) return ['Past', 'Present', 'Future'];
  if (count === 2) return ['Card I', 'Card II'];
  return ['Your Card'];
}

/* One face-down card in the deck — springs up + glows when selected. */
function DeckCard({ name, index, selected, order, onPress }) {
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.value = withSpring(selected ? 1 : 0, { damping: 13, stiffness: 200 });
  }, [selected]); // eslint-disable-line
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -12 * lift.value }, { scale: 1 + 0.06 * lift.value }],
  }));
  return (
    <Animated.View entering={FadeIn.delay(Math.min(index, 30) * 14)} style={styles.cell}>
      <Animated.View style={aStyle}>
        <PressableScale to={0.92} onPress={onPress} style={[styles.cardShell, selected && styles.cardShellOn]}>
          <CardBack style={StyleSheet.absoluteFill} moon={16} />
          {selected ? (
            <>
              <View style={styles.selRing} pointerEvents="none" />
              <View style={styles.selBadge}><Text style={styles.selNum}>{order}</Text></View>
            </>
          ) : null}
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
}

// Full-screen face-down picker. The deck is freshly shuffled every time, so the
// cards you pick are always unique + unseen until the reading is revealed.
export default function CardPicker({ count = 1, topicLabel, onDone, onCancel }) {
  const insets = useSafeAreaInsets();
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => shuffle(DECK), [seed]);
  const [picked, setPicked] = useState([]); // indices into `deck`
  const positions = positionsFor(count);

  const toggle = (i) => {
    setPicked((p) => {
      if (p.includes(i)) return p.filter((x) => x !== i);
      if (p.length >= count) return p;
      return [...p, i];
    });
  };

  const reshuffle = () => { setPicked([]); setSeed((s) => s + 1); };

  const ready = picked.length === count;
  const reveal = () => onDone(picked.map((i) => deck[i]));

  // one-shot bounce on the reveal button when it becomes ready
  const bounce = useSharedValue(1);
  useEffect(() => { if (ready) { bounce.value = 0.9; bounce.value = withSpring(1, { damping: 6, stiffness: 220 }); } }, [ready]); // eslint-disable-line
  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <AmbientStars count={22} />
      {/* Header */}
      <View style={styles.header}>
        <PressableScale onPress={onCancel} hitSlop={10}><Ionicons name="close" size={22} color={colors.textMuted} /></PressableScale>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Choose {count} card{count > 1 ? 's' : ''}</Text>
          <Text style={styles.sub}>{topicLabel} · deck shuffled ✨</Text>
        </View>
        <PressableScale to={0.94} onPress={reshuffle} style={styles.shuffleBtn}>
          <Ionicons name="shuffle" size={15} color={colors.gold} />
          <Text style={styles.shuffleText}>Shuffle</Text>
        </PressableScale>
      </View>

      {/* Chosen-cards tray */}
      <View style={styles.slots}>
        {positions.map((label, i) => {
          const filled = picked[i] !== undefined;
          return (
            <View key={i} style={styles.slot}>
              <View style={[styles.slotCard, !filled && styles.slotEmpty]}>
                {filled ? (
                  <Animated.View key={`f${picked[i]}`} entering={ZoomIn.springify().damping(12)} style={StyleSheet.absoluteFill}>
                    <CardBack style={StyleSheet.absoluteFill} moon={18} />
                    <View style={styles.slotNum}><Text style={styles.slotNumText}>{i + 1}</Text></View>
                  </Animated.View>
                ) : (
                  <Ionicons name="add" size={20} color={colors.textMuted} />
                )}
              </View>
              <Text style={[styles.slotLabel, filled && { color: colors.gold }]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>Apni intuition pe bharosa karo — cards face-down hain. Tap to choose.</Text>

      {/* Deck grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {deck.map((name, i) => {
          const on = picked.includes(i);
          const order = on ? picked.indexOf(i) + 1 : null;
          return <DeckCard key={`${seed}-${name}`} name={name} index={i} selected={on} order={order} onPress={() => toggle(i)} />;
        })}
      </ScrollView>

      {/* Reveal */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) + 92 }]}>
        <Animated.View style={bounceStyle}>
          <PressableScale
            to={0.96}
            onPress={ready ? reveal : undefined}
            style={[styles.reveal, ready ? styles.revealReady : styles.revealIdle]}
          >
            <Text style={[styles.revealText, !ready && { color: colors.textMuted }]}>
              {ready ? '✨ Reveal My Reading' : `Choose ${count - picked.length} more`}
            </Text>
          </PressableScale>
        </Animated.View>
      </View>
    </View>
  );
}

const CARD_W = '11.5%';
const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bgDeep, zIndex: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  title: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: font.tiny },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.bgCard },
  shuffleText: { color: colors.gold, fontSize: font.tiny, fontWeight: '800' },

  // chosen tray
  slots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.sm },
  slot: { alignItems: 'center' },
  slotCard: { width: 46, height: 74, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  slotEmpty: { borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.bgCard },
  slotNum: { position: 'absolute', top: 3, right: 3, width: 15, height: 15, borderRadius: 8, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  slotNumText: { color: '#1a1206', fontSize: 9, fontWeight: '900' },
  slotLabel: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700', marginTop: 5, letterSpacing: 0.4 },

  hint: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginVertical: spacing.sm, fontStyle: 'italic', paddingHorizontal: spacing.md },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: spacing.sm, gap: 6, paddingBottom: spacing.md },
  cell: { width: CARD_W },
  cardShell: { width: '100%', aspectRatio: 0.62, borderRadius: radius.sm, overflow: 'hidden' },
  cardShellOn: shadow({ color: '#e9c46a', opacity: 0.6, radius: 12, y: 4 }),
  selRing: { ...StyleSheet.absoluteFillObject, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.goldBright },
  selBadge: { position: 'absolute', top: 3, right: 3, width: 17, height: 17, borderRadius: 9, backgroundColor: colors.goldBright, alignItems: 'center', justifyContent: 'center' },
  selNum: { color: '#1a1206', fontWeight: '900', fontSize: 11 },

  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  reveal: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  revealReady: { backgroundColor: colors.gold, ...shadow({ color: '#e9c46a', opacity: 0.5, radius: 16, y: 6 }) },
  revealIdle: { backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.border },
  revealText: { color: '#1a1206', fontWeight: '800', fontSize: font.body },
});
