import React, { useEffect, useState } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import { getHistory, clearHistory } from '../lib/history';
import { colors, spacing, radius, font, serif } from '../theme';

const when = (ts) => {
  const d = new Date(ts);
  const day = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

export default function HistoryModal({ visible, onClose }) {
  const [items, setItems] = useState([]);
  useEffect(() => { if (visible) getHistory().then(setItems); }, [visible]);

  const wipe = async () => { await clearHistory(); setItems([]); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <PressableScale to={1} haptic={false} onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <LinearGradient colors={[colors.gold, '#f3d98c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.top} />
          <View style={styles.grab} />
          <View style={styles.head}>
            <Text style={styles.title}>Your Reading History</Text>
            {items.length ? (
              <PressableScale to={0.94} onPress={wipe} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                <Text style={styles.clearText}>Clear</Text>
              </PressableScale>
            ) : null}
          </View>

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="moon-outline" size={34} color={colors.textMuted} />
              <Text style={styles.emptyText}>No readings yet. Your journey begins with your first question ✨</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
              {items.map((r) => (
                <View key={r.id} style={styles.entry}>
                  <View style={styles.entryHead}>
                    <Text style={styles.entryTopic}>✨ {r.topicLabel}</Text>
                    <Text style={styles.entryWhen}>{when(r.at)}</Text>
                  </View>
                  <View style={styles.cardsRow}>
                    {r.cards.map((c, i) => (
                      <View key={i} style={styles.chip}>
                        {c.position ? <Text style={styles.chipPos}>{c.position}</Text> : null}
                        <Text style={styles.chipName}>{c.card}</Text>
                      </View>
                    ))}
                  </View>
                  {r.cards[0] ? <Text style={styles.snippet} numberOfLines={2}>{r.cards[0].text}</Text> : null}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    height: '82%', backgroundColor: '#160d24', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    borderWidth: 1, borderColor: colors.panelBorder, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, overflow: 'hidden',
  },
  top: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginTop: spacing.md, marginBottom: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  clearText: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyText: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', lineHeight: 20 },

  entry: { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  entryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryTopic: { color: colors.gold, fontSize: font.small, fontWeight: '800', letterSpacing: 0.4, flex: 1 },
  entryWhen: { color: colors.textMuted, fontSize: font.tiny },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  chip: { backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  chipPos: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  chipName: { color: colors.text, fontSize: font.tiny, fontWeight: '700' },
  snippet: { color: colors.textMuted, fontSize: font.tiny, lineHeight: 16, marginTop: spacing.sm, fontStyle: 'italic' },
});
