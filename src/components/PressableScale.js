import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { tap } from '../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Press "squeeze" + subtle dim + light haptic for any secondary button/link/row.
export default function PressableScale({ children, onPress, style, to = 0.94, hitSlop, haptic = true }) {
  const p = useSharedValue(0);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - to) * p.value }],
    opacity: 1 - 0.15 * p.value,
  }));
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={hitSlop}
      onPressIn={() => { p.value = withTiming(1, { duration: 80 }); if (haptic) tap(); }}
      onPressOut={() => (p.value = withTiming(0, { duration: 160 }))}
      style={[aStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
