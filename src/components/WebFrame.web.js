import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, font, spacing } from '../theme';

// Web build: render a real <iframe> with a loading placeholder behind it
// (so the frame area isn't just black while the bot connects).
export default function WebFrame({ uri, style }) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={[styles.wrap, style]}>
      {loading ? (
        <View style={[styles.center, { pointerEvents: 'none' }]}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.text}>Connecting to the cards…</Text>
        </View>
      ) : null}

      {React.createElement('iframe', {
        src: uri,
        onLoad: () => setLoading(false),
        style: { border: 'none', width: '100%', height: '100%', borderRadius: 0, background: 'transparent' },
        title: 'The Divine Tarot',
        allow: 'clipboard-write; microphone',
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.bgCardSolid },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  text: { color: colors.textMuted, fontSize: font.small },
});
