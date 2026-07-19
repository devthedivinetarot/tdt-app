import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

// Mystic face-down tarot back: violet gradient, gold double frame, centred moon
// and corner stars. Purely visual — size it via the `style` prop.
export default function CardBack({ style, moon = 20 }) {
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={['#2a1348', '#1c1030', '#120a22']} style={StyleSheet.absoluteFill} />
      <View style={styles.frame} />
      <Text style={[styles.star, styles.tl]}>✦</Text>
      <Text style={[styles.star, styles.tr]}>✦</Text>
      <Text style={[styles.star, styles.bl]}>✦</Text>
      <Text style={[styles.star, styles.br]}>✦</Text>
      <View style={styles.center}>
        <Ionicons name="moon" size={moon} color={colors.gold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.goldDeep },
  frame: { position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: 'rgba(233,196,106,0.35)', borderRadius: radius.sm - 2 },
  center: { alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute', color: 'rgba(233,196,106,0.55)', fontSize: 8 },
  tl: { top: 4, left: 5 }, tr: { top: 4, right: 5 }, bl: { bottom: 4, left: 5 }, br: { bottom: 4, right: 5 },
});
