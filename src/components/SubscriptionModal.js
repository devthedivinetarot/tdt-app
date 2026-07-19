import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import RazorpayCheckout from './RazorpayCheckout';
import { grantPremium } from '../lib/rateLimit';
import { useAuth } from '../context/AuthContext';
import { isRazorpayConfigured, PRICES } from '../lib/razorpay';
import { colors, spacing, radius, font, serif } from '../theme';

const BENEFITS = [
  'Unlimited readings — no daily limit',
  'Har intent: shaadi, baby, union, partner feelings & more',
  '30-day full access to Ginni Ki Baatein',
  'Har card ka verbatim authored guidance',
];

export default function SubscriptionModal({ visible, onClose, onSubscribed }) {
  const { user } = useAuth();
  const [pay, setPay] = useState(false);

  const subscribe = async () => {
    if (isRazorpayConfigured()) { setPay(true); return; } // real checkout
    await grantPremium(30); // incubated grant (until you paste your Key ID)
    onSubscribed && onSubscribed();
  };

  const onPaid = async () => {
    setPay(false);
    await grantPremium(30);
    onSubscribed && onSubscribed();
  };

  return (
    <>
    <Modal visible={visible && !pay} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <PressableScale to={1} onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={styles.card}>
          <View style={styles.lock}><Ionicons name="sparkles" size={26} color={colors.gold} /></View>
          <Text style={styles.title}>Aaj ki free readings khatam</Text>
          <Text style={styles.sub}>Ginni ke saath apni journey continue rakhiye — full access unlock kijiye.</Text>

          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.row}>
              <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
              <Text style={styles.rowText}>{b}</Text>
            </View>
          ))}

          <PressableScale to={0.96} onPress={subscribe} style={styles.subscribe}>
            <Text style={styles.subscribeText}>
              {isRazorpayConfigured() ? `Subscribe ₹${PRICES.subscription} — Full Access ✨` : 'Subscribe — Full Access ✨'}
            </Text>
          </PressableScale>
          <Text style={styles.secure}>Secure payment via Razorpay · 30-day access</Text>

          <PressableScale onPress={onClose} style={styles.later}>
            <Text style={styles.laterText}>Baad mein</Text>
          </PressableScale>
        </View>
      </View>
    </Modal>

    <RazorpayCheckout
      visible={pay}
      amount={PRICES.subscription}
      description="30-day full access — Ginni Ki Baatein"
      prefill={{ name: user && user.name, email: user && user.email, contact: user && user.phone }}
      onSuccess={onPaid}
      onClose={() => setPay(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: '#160d24', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.panelBorder, padding: spacing.xl, alignItems: 'center' },
  lock: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700', textAlign: 'center', marginTop: spacing.md },
  sub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.md },
  rowText: { color: colors.text, fontSize: font.small, flex: 1, lineHeight: 20 },
  subscribe: { alignSelf: 'stretch', backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg },
  subscribeText: { color: '#1a1206', fontWeight: '800', fontSize: font.body },
  secure: { color: colors.textMuted, fontSize: font.tiny, marginTop: spacing.sm },
  later: { marginTop: spacing.md, paddingVertical: 6 },
  laterText: { color: colors.textMuted, fontSize: font.small, textDecorationLine: 'underline' },
});
