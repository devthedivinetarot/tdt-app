import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import Screen from '../src/components/Screen';
import GradientButton from '../src/components/GradientButton';
import { colors, spacing, radius, font } from '../src/theme';

const GRID = Array.from({ length: 12 }, (_, i) => i);

function FlipCard({ index, picked, onPress }) {
  const on = picked.includes(index);
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const press = () => {
    scale.value = withSpring(1.08, { damping: 6 }, () => {
      scale.value = withSpring(1);
    });
    onPress(index);
  };

  return (
    <Animated.View style={[styles.cardWrap, aStyle]} entering={FadeIn.delay(index * 40)}>
      <Pressable style={[styles.card, on && styles.cardOn]} onPress={press}>
        <Text style={styles.cardFace}>{on ? '🔮' : '✦'}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PickCards() {
  const { t } = useTranslation();
  const router = useRouter();
  const { q } = useLocalSearchParams();
  const [picked, setPicked] = useState([]);

  const toggle = (i) =>
    setPicked((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 3) return prev;
      return [...prev, i];
    });

  const ready = picked.length === 3;

  return (
    <Screen>
      <Text style={styles.title}>{t('reading_pick_title')}</Text>
      <Text style={styles.hint}>{t('reading_pick_hint')}</Text>

      <View style={styles.grid}>
        {GRID.map((i) => (
          <FlipCard key={i} index={i} picked={picked} onPress={toggle} />
        ))}
      </View>

      <Text style={styles.count}>{picked.length} / 3</Text>

      <GradientButton
        label={`${t('reading_reveal_title')} ✨`}
        onPress={() => router.push({ pathname: '/reading-result', params: { q } })}
        style={[!ready && { opacity: 0.45 }]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  hint: { color: colors.textMuted, fontSize: font.small, marginTop: 4, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrap: { width: '31%', marginBottom: spacing.sm },
  card: {
    aspectRatio: 0.68,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOn: { backgroundColor: 'rgba(233,196,106,0.18)', borderColor: colors.gold },
  cardFace: { fontSize: 28, color: colors.gold },
  count: { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md },
});
