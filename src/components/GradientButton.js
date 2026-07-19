import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, gradients, radius, font, shadow, IS_WEB } from '../theme';
import { medium } from '../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AGradient = Animated.createAnimatedComponent(LinearGradient);

// Primary gold CTA — clean pill (no dark corners), theme glow, looping sheen,
// and a tactile press: squeezes, sinks, glow flares, surface darkens.
export default function GradientButton({ label, onPress, style }) {
  const press = useSharedValue(0);
  const sheen = useSharedValue(0);

  useEffect(() => {
    // On web reanimated runs on the MAIN thread — an infinite loop here (× every
    // mounted button) freezes the tab ("page not responding"). Only loop on native.
    if (IS_WEB) return;
    sheen.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const wrapStyle = useAnimatedStyle(() => {
    const s = {
      transform: [{ scale: 1 - 0.05 * press.value }, { translateY: press.value * 1.5 }],
      borderColor: `rgba(245,222,179,${0.5 + press.value * 0.45})`,
    };
    // Animate the native glow only off-web (web uses a static boxShadow).
    if (!IS_WEB) {
      s.shadowOpacity = 0.35 + press.value * 0.45;
      s.shadowRadius = 14 + press.value * 10;
    }
    return s;
  });
  const sheenStyle = useAnimatedStyle(() => ({ opacity: 0.05 + sheen.value * 0.13 }));
  const darkenStyle = useAnimatedStyle(() => ({ opacity: press.value * 0.16 }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { press.value = withTiming(1, { duration: 90 }); medium(); }}
      onPressOut={() => (press.value = withTiming(0, { duration: 200 }))}
      style={[styles.wrap, wrapStyle, style]}
    >
      <LinearGradient colors={gradients.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill}>
        <Animated.View style={[styles.overlay, styles.noTouch, styles.sheen, sheenStyle]} />
        <Animated.View style={[styles.overlay, styles.noTouch, styles.darken, darkenStyle]} />
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,222,179,0.5)',
    ...shadow({ color: colors.gold, opacity: 0.4, radius: 16, y: 0, elevation: 6 }),
  },
  fill: { paddingVertical: 11, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject },
  noTouch: { pointerEvents: 'none' },
  sheen: { backgroundColor: '#ffffff' },
  darken: { backgroundColor: '#000000' },
  text: { color: '#1a1206', fontSize: font.body, fontWeight: '800', letterSpacing: 0.2 },
});
