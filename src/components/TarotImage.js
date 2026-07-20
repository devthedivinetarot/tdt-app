import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors, font } from '../theme';

// Card art with on-device disk caching (loads instantly after first fetch and
// works offline) + a graceful text fallback if an image can't load.
export default function TarotImage({ uri, name, style }) {
  const [failed, setFailed] = useState(false);
  if (failed || !uri) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText} numberOfLines={3}>{name}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={220}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.bgCardSolid, alignItems: 'center', justifyContent: 'center', padding: 4 },
  fallbackText: { color: colors.gold, fontSize: font.tiny, textAlign: 'center', fontWeight: '700' },
});
