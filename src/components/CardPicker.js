import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  ZoomIn, Easing,
  useSharedValue, useAnimatedStyle, useAnimatedScrollHandler,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated';
import PressableScale from './PressableScale';
import CardBack from './CardBack';
import AmbientStars from './AmbientStars';
import { DECK } from '../data/tarot';
import { colors, spacing, radius, font, serif, shadow, IS_WEB } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = 96;
const CARD_H = 154;
const STEP = 40;                    // horizontal advance per card (→ heavy overlap)
const ROW_H = CARD_H + 96;          // room for cards to rise
const HALF = SCREEN_W / 2;
const SIDE = HALF - CARD_W / 2;     // padding so the first/last card can reach centre

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

/* One face-down card in the arc. It deals in from the stack, fans by its
   distance from centre, rises when in focus, and lifts out when chosen. */
function FanCard({ name, index, selected, order, onPress, scrollX }) {
  const appear = useSharedValue(0);
  const sel = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    appear.value = withDelay(Math.min(index, 42) * 10, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));
  }, []); // eslint-disable-line
  useEffect(() => { sel.value = withSpring(selected ? 1 : 0, { damping: 14, stiffness: 180 }); }, [selected]); // eslint-disable-line

  const aStyle = useAnimatedStyle(() => {
    const d = appear.value;
    const s = sel.value;
    const cardCenter = SIDE + index * STEP + CARD_W / 2;
    // On web (reanimated runs on the main thread) reading scrollX here would make
    // all 78 cards recompute every scroll frame → jank. Use a static fan on web.
    const sx = IS_WEB ? 0 : scrollX.value;
    const dist = cardCenter - sx - HALF;                    // px from viewport centre
    const nd = Math.max(-1, Math.min(1, dist / (STEP * 4))); // fan tilt, saturates at edges
    const near = 1 - Math.min(1, Math.abs(dist) / (STEP * 2.4)); // 1 at centre → 0 away
    const flyX = (1 - d) * Math.max(-150, Math.min(150, HALF - cardCenter)) * 0.5;
    const ty = ((-near * 20) + Math.abs(nd) * 14) * d - 48 * s;
    const rot = nd * 18 * d;
    return {
      opacity: d,
      zIndex: s > 0.5 ? 200 : Math.round(near * 30),
      transform: [
        { translateX: flyX },
        { translateY: (1 - d) * 28 + ty },
        { rotateZ: `${rot}deg` },
        { scale: (0.7 + 0.3 * d) * (1 + near * 0.06 + 0.06 * s) },
      ],
    };
  });

  return (
    <View style={styles.slotItem}>
      <Animated.View style={[styles.cardHolder, aStyle]}>
        <PressableScale to={0.9} onPress={onPress} style={[styles.cardShell, selected && styles.cardShellOn]}>
          <CardBack style={StyleSheet.absoluteFill} moon={20} />
          {selected ? (
            <>
              <View style={styles.selRing} pointerEvents="none" />
              <View style={styles.selBadge}><Text style={styles.selNum}>{order}</Text></View>
            </>
          ) : null}
        </PressableScale>
      </Animated.View>
    </View>
  );
}

// Full-screen face-down picker. Fresh shuffle each time → unique, unseen cards.
export default function CardPicker({ count = 1, topicLabel, onDone, onCancel }) {
  const insets = useSafeAreaInsets();
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => shuffle(DECK), [seed]);
  const [picked, setPicked] = useState([]); // indices into `deck`
  const positions = positionsFor(count);

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({ onScroll: (e) => { scrollX.value = e.contentOffset.x; } });

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
          <Text style={styles.title}>Draw {count} card{count > 1 ? 's' : ''}</Text>
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

      <Text style={styles.hint}>Swipe the spread · tap a card to draw it ✨</Text>

      {/* Fanned spread */}
      <View style={styles.fanArea}>
        <View style={styles.focusGlow} pointerEvents="none" />
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={STEP}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: SIDE, alignItems: 'flex-end' }}
        >
          {deck.map((name, i) => {
            const on = picked.includes(i);
            const order = on ? picked.indexOf(i) + 1 : null;
            return <FanCard key={`${seed}-${name}`} name={name} index={i} selected={on} order={order} onPress={() => toggle(i)} scrollX={scrollX} />;
          })}
        </Animated.ScrollView>
        <View style={styles.pointer} pointerEvents="none"><Ionicons name="caret-up" size={18} color={colors.gold} /></View>
      </View>

      {/* Reveal */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) + 92 }]}>
        <Animated.View style={bounceStyle}>
          <PressableScale
            to={0.96}
            onPress={ready ? reveal : undefined}
            style={[styles.reveal, ready ? styles.revealReady : styles.revealIdle]}
          >
            <Text style={[styles.revealText, !ready && { color: colors.textMuted }]}>
              {ready ? '✨ Reveal My Reading' : `Draw ${count - picked.length} more`}
            </Text>
          </PressableScale>
        </Animated.View>
      </View>
    </View>
  );
}

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

  // fanned spread
  fanArea: { flex: 1, justifyContent: 'center' },
  focusGlow: { position: 'absolute', alignSelf: 'center', bottom: 40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(233,196,106,0.10)' },
  slotItem: { width: STEP, height: ROW_H, alignItems: 'center', justifyContent: 'flex-end' },
  cardHolder: { width: CARD_W, height: CARD_H },
  cardShell: { width: CARD_W, height: CARD_H, borderRadius: radius.md, overflow: 'hidden', ...shadow({ color: '#000000', opacity: 0.5, radius: 10, y: 8 }) },
  cardShellOn: shadow({ color: '#e9c46a', opacity: 0.7, radius: 16, y: 4 }),
  selRing: { ...StyleSheet.absoluteFillObject, borderRadius: radius.md, borderWidth: 2.5, borderColor: colors.goldBright },
  selBadge: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.goldBright, alignItems: 'center', justifyContent: 'center' },
  selNum: { color: '#1a1206', fontWeight: '900', fontSize: 12 },
  pointer: { position: 'absolute', alignSelf: 'center', bottom: 6 },

  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  reveal: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  revealReady: { backgroundColor: colors.gold, ...shadow({ color: '#e9c46a', opacity: 0.5, radius: 16, y: 6 }) },
  revealIdle: { backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.border },
  revealText: { color: '#1a1206', fontWeight: '800', fontSize: font.body },
});
