import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { IS_WEB } from '../theme';

// A diagonal light sweep that glides across whatever it overlays. Loops on
// native; stays hidden on web (main-thread loops freeze the tab).
export default function Shimmer({ style, delay = 0, duration = 1900 }) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (IS_WEB) return;
    x.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, false));
  }, []); // eslint-disable-line
  const st = useAnimatedStyle(() => ({
    opacity: x.value > 0.02 && x.value < 0.98 ? 0.9 : 0,
    transform: [{ translateX: -140 + x.value * 320 }, { rotate: '20deg' }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip, style]}>
      <Animated.View style={[styles.bar, st]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  bar: { position: 'absolute', top: -40, bottom: -40, width: 46 },
});
