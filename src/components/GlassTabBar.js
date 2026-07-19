import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, gradients, radius, font, shadow, IS_WEB } from '../theme';
import { select } from '../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AGradient = Animated.createAnimatedComponent(LinearGradient);

// icon (filled / outline) + notification dot per route
const TABS = {
  index:   { on: 'home',    off: 'home-outline',    dot: false },
  reading: { on: 'moon',    off: 'moon-outline',    dot: false },
  courses: { on: 'book',    off: 'book-outline',    dot: false },
  kundli:  { on: 'heart',   off: 'heart-outline',   dot: false },
  profile: { on: 'person',  off: 'person-outline',  dot: true  },
};

function TabItem({ focused, cfg, label, onPress }) {
  const a = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    a.value = withSpring(focused ? 1 : 0, { damping: 13, stiffness: 150 });
  }, [focused]);

  // Gold circle behind the active icon — pops + lifts + glows
  const circle = useAnimatedStyle(() => {
    const s = { transform: [{ scale: 0.7 + a.value * 0.3 }, { translateY: -a.value * 10 }] };
    if (!IS_WEB) s.shadowOpacity = a.value * 0.6;
    return s;
  });
  const fill = useAnimatedStyle(() => ({ opacity: a.value }));
  const filled = useAnimatedStyle(() => ({ opacity: a.value, transform: [{ translateY: -a.value * 10 }] }));
  const outline = useAnimatedStyle(() => ({ opacity: 1 - a.value }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(a.value, [0, 1], [colors.textMuted, colors.gold]),
    transform: [{ scale: 0.94 + a.value * 0.06 }],
  }));

  return (
    <AnimatedPressable style={styles.item} onPress={onPress} hitSlop={6}>
      <View style={styles.iconArea}>
        <Animated.View style={[styles.circle, circle]}>
          <AGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.circleFill, fill]} />
        </Animated.View>
        {/* outline (inactive) */}
        <Animated.View style={[styles.iconAbs, outline]}>
          <Ionicons name={cfg.off} size={23} color={colors.textMuted} />
        </Animated.View>
        {/* filled (active) — dark on gold */}
        <Animated.View style={[styles.iconAbs, filled]}>
          <Ionicons name={cfg.on} size={23} color="#1a1206" />
        </Animated.View>
        {cfg.dot ? <View style={styles.dot} /> : null}
      </View>
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

export default function GlassTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BlurView intensity={Platform.OS === 'android' ? 70 : 45} tint="dark" style={styles.bar}>
        {state.routes.map((route, index) => {
          const cfg = TABS[route.name];
          if (!cfg) return null;
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = (options.title || route.name);

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) { select(); navigation.navigate(route.name); }
          };

          return <TabItem key={route.key} focused={focused} cfg={cfg} label={label} onPress={onPress} />;
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', backgroundColor: 'transparent' },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '92%',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    ...shadow({ color: '#000000', opacity: 0.45, radius: 22, y: 12, elevation: 18 }),
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  iconArea: { width: 46, height: 40, alignItems: 'center', justifyContent: 'center' },
  circle: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(245,222,179,0.9)',
    ...shadow({ color: colors.gold, opacity: IS_WEB ? 0.5 : 0, radius: 12, y: 0, elevation: 0 }),
  },
  circleFill: { borderRadius: 23 },
  iconAbs: { position: 'absolute' },
  dot: { position: 'absolute', top: 2, right: 6, width: 9, height: 9, borderRadius: 5, backgroundColor: '#f43f5e', borderWidth: 1.5, borderColor: colors.bgDeep },
  label: { fontSize: font.tiny, fontWeight: '700', marginTop: 6 },
});
