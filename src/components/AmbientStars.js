import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { colors, IS_WEB } from '../theme';

// Ambient magical background: drifting glowing orbs + twinkling stars.
// On NATIVE the layer breathes (reanimated on the UI thread). On WEB — where
// reanimated runs on the main thread and infinite loops freeze the tab — it
// renders as a still starfield (still pretty, zero cost). pointerEvents off.

const { width: W, height: H } = Dimensions.get('window');
const rand = (a, b) => a + Math.random() * (b - a);

function makeStars(n) {
  return Array.from({ length: n }, () => ({
    x: rand(0, W), y: rand(0, H * 1.15),
    size: rand(1.4, 3.4),
    base: rand(0.12, 0.5),
    peak: rand(0.65, 1),
    dur: rand(1400, 3200),
    delay: rand(0, 2600),
    drift: rand(-7, 7),
    gold: Math.random() > 0.35,
  }));
}

function Star({ s }) {
  const tw = useSharedValue(0);
  React.useEffect(() => {
    if (IS_WEB) return; // static on web
    tw.value = withDelay(s.delay, withRepeat(withTiming(1, { duration: s.dur, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, []); // eslint-disable-line
  const st = useAnimatedStyle(() => ({
    opacity: s.base + tw.value * (s.peak - s.base),
    transform: [{ translateY: -tw.value * s.drift }],
  }));
  return (
    <Animated.View
      style={[{
        position: 'absolute', left: s.x, top: s.y, width: s.size, height: s.size,
        borderRadius: s.size, backgroundColor: s.gold ? colors.gold : '#cdb8ff',
      }, st]}
    />
  );
}

function Orb({ o }) {
  const p = useSharedValue(0);
  React.useEffect(() => {
    if (IS_WEB) return;
    p.value = withRepeat(withTiming(1, { duration: o.dur, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []); // eslint-disable-line
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: o.dx * p.value }, { translateY: o.dy * p.value }, { scale: 1 + 0.14 * p.value }],
  }));
  return (
    <Animated.View
      style={[{
        position: 'absolute', left: o.x, top: o.y, width: o.r, height: o.r,
        borderRadius: o.r, backgroundColor: o.color,
      }, st]}
    />
  );
}

export default function AmbientStars({ count = 28 }) {
  const stars = useMemo(() => makeStars(IS_WEB ? Math.min(count, 22) : count), []); // eslint-disable-line
  const orbs = useMemo(() => ([
    { x: -70, y: 30, r: 230, color: 'rgba(233,196,106,0.06)', dx: 34, dy: 22, dur: 9000 },
    { x: W - 150, y: H * 0.46, r: 280, color: 'rgba(150,90,230,0.07)', dx: -26, dy: -34, dur: 11500 },
    { x: W * 0.28, y: H * 0.86, r: 210, color: 'rgba(233,196,106,0.05)', dx: 22, dy: -18, dur: 10200 },
  ]), []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {orbs.map((o, i) => <Orb key={`o${i}`} o={o} />)}
      {stars.map((s, i) => <Star key={`s${i}`} s={s} />)}
    </View>
  );
}
