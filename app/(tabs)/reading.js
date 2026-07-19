import React from 'react';
import { View, StyleSheet } from 'react-native';
import GinniChat from '../../src/components/GinniChat';
import { colors } from '../../src/theme';

// Native reading chat — Ginni Ki Baatein, ported from the tdt-ginni repo.
// Fully offline & deterministic (no iframe, no Supabase). Works everywhere.
export default function Reading() {
  return (
    <View style={styles.root}>
      <GinniChat />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
});
