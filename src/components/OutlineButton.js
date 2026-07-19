import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, radius, font } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Secondary pill button — bordered, gold text. On press it squeezes and the
// surface fills with a soft gold tint while the border brightens.
export default function OutlineButton({ label, onPress, style, textStyle }) {
  const p = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.04 * p.value }],
    backgroundColor: interpolateColor(p.value, [0, 1], ['rgba(233,196,106,0)', 'rgba(233,196,106,0.18)']),
    borderColor: interpolateColor(p.value, [0, 1], [colors.border, colors.gold]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (p.value = withTiming(1, { duration: 90 }))}
      onPressOut={() => (p.value = withTiming(0, { duration: 200 }))}
      style={[styles.btn, aStyle, style]}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.text, fontSize: font.small, fontWeight: '700' },
});
