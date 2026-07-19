import React, { useEffect } from 'react';
import { Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, runOnJS,
} from 'react-native-reanimated';
import AmbientStars from './AmbientStars';
import { ASSETS } from '../assets';
import { colors, gradients, serif, font, spacing } from '../theme';

const AImage = Animated.createAnimatedComponent(Image);

// One-shot launch intro: logo blooms in, name + tagline rise, then the whole
// layer fades away and unmounts. Pure timing (no loops) — safe on web too.
export default function IntroSplash({ onDone }) {
  const p = useSharedValue(0);   // bloom in
  const out = useSharedValue(0); // fade out

  useEffect(() => {
    p.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.back(1.5)) });
    out.value = withDelay(1850, withTiming(1, { duration: 520 }, (fin) => {
      if (fin) runOnJS(onDone)();
    }));
  }, []); // eslint-disable-line

  const root = useAnimatedStyle(() => ({ opacity: 1 - out.value }));
  const logo = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.5 + 0.5 * p.value }, { rotate: `${(1 - p.value) * -12}deg` }] }));
  const name = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * 14 }] }));
  const tag = useAnimatedStyle(() => ({ opacity: p.value * p.value, transform: [{ translateY: (1 - p.value) * 20 }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, root]}>
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <AmbientStars count={34} />
      <AImage source={{ uri: ASSETS.logo }} style={[styles.logo, logo]} resizeMode="contain" />
      <Animated.Text style={[styles.brand, name]}>The Divine Tarot</Animated.Text>
      <Animated.Text style={[styles.tag, tag]}>✦  PREMIUM TAROT GUIDANCE  ✦</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', zIndex: 999, backgroundColor: colors.bgDeep },
  logo: { width: 110, height: 110, marginBottom: spacing.lg },
  brand: { color: colors.text, fontFamily: serif, fontSize: font.display, fontWeight: '700', letterSpacing: 0.5 },
  tag: { color: colors.gold, fontSize: font.tiny, fontWeight: '800', letterSpacing: 2.5, marginTop: spacing.sm },
});
