import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import PressableScale from './PressableScale';
import CardBack from './CardBack';
import TarotImage from './TarotImage';
import { DECK, cardImage } from '../data/tarot';
import KB from '../data/ginni-kb';
import { success } from '../lib/haptics';
import { colors, spacing, radius, font, serif } from '../theme';

const dateKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const dayNumber = (d = new Date()) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);

function meaningFor(card) {
  const raw = (KB.universe_guidance && KB.universe_guidance[card]) || '';
  return raw.replace(/^[^\n]*\n/, '').trim(); // strip the "Card:\n" prefix
}

export default function CardOfDay() {
  const today = dateKey();
  const card = DECK[dayNumber() % DECK.length];
  const meaning = meaningFor(card);

  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(1);
  const p = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const rev = await AsyncStorage.getItem('cotd.rev.' + today);
      if (rev === '1') { setRevealed(true); p.value = 1; }
      const last = await AsyncStorage.getItem('cotd.last');
      let s = parseInt((await AsyncStorage.getItem('cotd.streak')) || '0', 10);
      if (last !== today) {
        const y = dateKey(new Date(Date.now() - 86400000));
        s = last === y ? s + 1 : 1;
        await AsyncStorage.setItem('cotd.last', today);
        await AsyncStorage.setItem('cotd.streak', String(s));
      }
      setStreak(s || 1);
    })();
  }, []); // eslint-disable-line

  const reveal = async () => {
    if (revealed) return;
    p.value = withTiming(1, { duration: 640 });
    setRevealed(true);
    success();
    await AsyncStorage.setItem('cotd.rev.' + today, '1');
  };

  const back = useAnimatedStyle(() => ({ opacity: p.value < 0.5 ? 1 : 0, transform: [{ perspective: 800 }, { rotateY: `${p.value * 180}deg` }] }));
  const front = useAnimatedStyle(() => ({ opacity: p.value >= 0.5 ? 1 : 0, transform: [{ perspective: 800 }, { rotateY: `${p.value * 180 - 180}deg` }] }));

  return (
    <LinearGradient colors={['rgba(42,19,72,0.55)', 'rgba(28,16,48,0.35)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>✦ CARD OF THE DAY</Text>
        <View style={styles.streak}>
          <Ionicons name="flame" size={13} color={colors.coral} />
          <Text style={styles.streakText}>{streak} day{streak > 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <PressableScale to={0.96} onPress={reveal} style={styles.cardBox} haptic={!revealed}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.face, back]}>
            <CardBack style={StyleSheet.absoluteFill} moon={30} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.face, front]}>
            <TarotImage uri={cardImage(card)} name={card} style={styles.img} />
          </Animated.View>
        </PressableScale>

        <View style={styles.info}>
          {revealed ? (
            <>
              <Text style={styles.name}>{card}</Text>
              <Text style={styles.meaning} numberOfLines={6}>{meaning || 'Aaj ka din tumhare liye ek naya sandesh laaya hai. ✨'}</Text>
            </>
          ) : (
            <>
              <Text style={styles.name}>Aaj ka message</Text>
              <Text style={styles.meaning}>Tap the card to reveal today's guidance from the universe.</Text>
              <View style={styles.tapHint}><Ionicons name="hand-left-outline" size={14} color={colors.gold} /><Text style={styles.tapHintText}>Tap to flip</Text></View>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, borderWidth: 1, borderColor: colors.panelBorder, padding: spacing.lg, marginTop: spacing.xl },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  eyebrow: { color: colors.gold, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1.5 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(246,96,77,0.5)', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  streakText: { color: colors.coral, fontSize: font.tiny, fontWeight: '800' },

  row: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  cardBox: { width: 96, height: 160 },
  face: { borderRadius: radius.md, overflow: 'hidden', backfaceVisibility: 'hidden' },
  img: { width: '100%', height: '100%', borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder },
  imgFallback: { backgroundColor: colors.bgCardSolid, alignItems: 'center', justifyContent: 'center', padding: 6 },
  fallbackText: { color: colors.gold, fontSize: font.small, fontWeight: '700', textAlign: 'center' },

  info: { flex: 1 },
  name: { color: colors.gold, fontFamily: serif, fontSize: font.h2, fontWeight: '700' },
  meaning: { color: '#e7ddf5', fontSize: font.small, lineHeight: 20, marginTop: spacing.sm },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.md },
  tapHintText: { color: colors.gold, fontSize: font.tiny, fontWeight: '700' },
});
