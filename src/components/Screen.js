import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { gradients, spacing, colors, shadow } from '../theme';
import AmbientStars from './AmbientStars';

// Full-screen mystical gradient background + scroll area with a custom
// ANIMATED gold scroll indicator (thumb tracks position, fades in while
// scrolling and out when idle). Adds bottom padding to clear the glass nav.
export default function Screen({ children, scroll = true, contentStyle, onRefresh, refreshable = true }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const TOP = insets.top + 6;
  const BOTTOM = 122 + insets.bottom;
  const pad = {
    paddingTop: insets.top + spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 130 + insets.bottom,
  };

  const scrollY = useSharedValue(0);
  const layoutH = useSharedValue(1);
  const contentH = useSharedValue(1);
  const active = useSharedValue(0);

  // Per-screen entrance: fade + rise each time this tab gains focus.
  const focused = useIsFocused();
  const enter = useSharedValue(0);
  useEffect(() => {
    if (focused) { enter.value = 0; enter.value = withTiming(1, { duration: 380 }); }
  }, [focused]);
  const enterStyle = useAnimatedStyle(() => ({ opacity: enter.value, transform: [{ translateY: (1 - enter.value) * 12 }] }));

  const doRefresh = async () => {
    setRefreshing(true);
    enter.value = 0;
    try { if (onRefresh) await onRefresh(); else await new Promise((r) => setTimeout(r, 850)); } catch (e) { /* ignore */ }
    enter.value = withTiming(1, { duration: 420 });
    setRefreshing(false);
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      active.value = withTiming(1, { duration: 120 });
    },
    onEndDrag: () => {
      active.value = withTiming(0, { duration: 700 });
    },
    onMomentumEnd: () => {
      active.value = withTiming(0, { duration: 700 });
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    const track = Math.max(layoutH.value - TOP - BOTTOM, 1);
    const ratio = layoutH.value / Math.max(contentH.value, layoutH.value);
    const scrollable = contentH.value > layoutH.value + 4;
    const thumbH = Math.max(track * ratio, 36);
    const maxScroll = Math.max(contentH.value - layoutH.value, 1);
    const y = (scrollY.value / maxScroll) * (track - thumbH);
    return {
      height: thumbH,
      transform: [{ translateY: y }, { scaleX: 0.6 + active.value * 0.4 }],
      opacity: scrollable ? 0.18 + active.value * 0.72 : 0,
    };
  });

  if (!scroll) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
        <AmbientStars />
        <Animated.View style={[styles.flex, pad, contentStyle, enterStyle]}>{children}</Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <AmbientStars />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={(e) => (layoutH.value = e.nativeEvent.layout.height)}
        onContentSizeChange={(w, h) => (contentH.value = h)}
        contentContainerStyle={[pad, contentStyle]}
        refreshControl={refreshable ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={doRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
            progressBackgroundColor="#160d24"
            title="✦ Consulting the stars…"
            titleColor={colors.textMuted}
          />
        ) : undefined}
      >
        <Animated.View style={enterStyle}>{children}</Animated.View>
      </Animated.ScrollView>

      {/* Custom animated scroll indicator */}
      <View style={[styles.track, { top: TOP, bottom: BOTTOM, pointerEvents: 'none' }]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  track: { position: 'absolute', right: 3, width: 4, alignItems: 'center' },
  thumb: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    ...shadow({ color: colors.gold, opacity: 0.7, radius: 5, y: 0, elevation: 0 }),
  },
});
