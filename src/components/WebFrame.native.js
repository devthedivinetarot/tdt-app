import React, { useState } from 'react';
import { View, ActivityIndicator, Text, Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, font, spacing, radius } from '../theme';

// Native build (iOS/Android): render react-native-webview with loading +
// error/retry handling so a failed load never leaves a spinner hanging.
export default function WebFrame({ uri, style }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = () => {
    setError(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <View style={[styles.wrap, style]}>
      {!error && (
        <WebView
          key={reloadKey}
          source={{ uri }}
          style={styles.web}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          startInLoadingState
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
        />
      )}

      {loading && !error && (
        <View style={[styles.center, { pointerEvents: 'none' }]}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.text}>Connecting to the cards…</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.text}>Couldn't load the reading.{'\n'}Please check your connection.</Text>
          <Pressable onPress={retry} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.bgCardSolid },
  web: { flex: 1, backgroundColor: 'transparent' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  text: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', lineHeight: 20 },
  retry: { borderWidth: 1, borderColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 22, paddingVertical: 10 },
  retryText: { color: colors.gold, fontWeight: '800' },
});
