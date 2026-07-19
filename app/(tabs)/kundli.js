import React, { useState } from 'react';
import { View, Text, TextInput, Modal, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Screen from '../../src/components/Screen';
import GradientButton from '../../src/components/GradientButton';
import PressableScale from '../../src/components/PressableScale';
import { DatePickerField, TimePickerField, PlacePickerField } from '../../src/components/Pickers';
import RazorpayCheckout from '../../src/components/RazorpayCheckout';
import { useAuth } from '../../src/context/AuthContext';
import { isRazorpayConfigured, PRICES } from '../../src/lib/razorpay';
import { colors, spacing, radius, font, serif } from '../../src/theme';

// If Razorpay isn't configured yet, the button falls back to the live kundli page.
const KUNDLI_FALLBACK_URL = 'https://thedivinetarotonline.com/kundli-milan';

const TIMEZONES = [
  'India (IST +5:30)',
  'UTC (+0:00)',
  'Nepal (+5:45)',
  'Pakistan (+5:00)',
  'Gulf (+4:00)',
  'UK (+0:00 / +1:00)',
  'US Eastern (-5:00)',
  'US Pacific (-8:00)',
];

const BENEFITS = [
  'Full 36-guna Ashtakoota compatibility score',
  'All 8 kootas — and what they mean for your life together',
  'Nadi & Bhakoot dosha analysis with remedies',
  'Detailed report emailed to your inbox',
];

const DISCLAIMER =
  'Ashtakoota computed from approximate Moon positions (Lahiri ayanamsa). A guide to reflect clearly — not a substitute for a professional jyotishi or your own judgement.';

function Field({ label, hint, icon, value, onChangeText, placeholder, onPress, keyboardType }) {
  const Body = (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      {onPress ? (
        <Text style={[styles.input, { paddingVertical: 2 }]}>{value}</Text>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
        />
      )}
      {onPress ? <Ionicons name="chevron-down" size={16} color={colors.textMuted} /> : null}
    </View>
  );
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      {onPress ? <PressableScale to={0.98} onPress={onPress}>{Body}</PressableScale> : Body}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function PersonCard({ tag, role, data, set, onTz }) {
  return (
    <View style={styles.person}>
      <Text style={styles.personTag}>
        {tag} <Text style={styles.personRole}>{role}</Text>
      </Text>
      <Field label="NAME" icon="person-outline" placeholder="Full name" value={data.name}
        onChangeText={(v) => set({ ...data, name: v })} hint="So we can personalise your report" />
      <DatePickerField label="DATE OF BIRTH" value={data.dob} onChange={(v) => set({ ...data, dob: v })} placeholder="Select date" />
      <TimePickerField label="TIME OF BIRTH" value={data.time} onChange={(v) => set({ ...data, time: v })} placeholder="Select time" />
      <PlacePickerField label="BIRTH PLACE" value={data.place} onChange={(v) => set({ ...data, place: v })} placeholder="Select city" />
      <Field label="BIRTH TIMEZONE" icon="globe-outline" value={TIMEZONES[data.tz]} onPress={onTz} />
    </View>
  );
}

export default function Kundli() {
  const { user } = useAuth();
  const prof = (user && user.profile) || {};

  // Person 1 prefills from the signed-in user's saved profile (still editable).
  const [p1, setP1] = useState({
    name: (user && user.name) || '',
    dob: prof.dob || '',
    time: prof.time || '12:00 PM',
    place: prof.birthplace || '',
    tz: 0,
  });
  const [p2, setP2] = useState({ name: '', dob: '', time: '12:00 PM', place: '', tz: 0 });
  const [tzFor, setTzFor] = useState(null); // 1 | 2 | null
  const [result, setResult] = useState(false);
  const [email, setEmail] = useState((user && user.email) || '');
  const [payOpen, setPayOpen] = useState(false);
  const [paid, setPaid] = useState(false);

  const pickTz = (i) => {
    if (tzFor === 1) setP1({ ...p1, tz: i });
    if (tzFor === 2) setP2({ ...p2, tz: i });
    setTzFor(null);
  };

  const calculate = () => {
    if (!p1.dob.trim() || !p2.dob.trim()) return;
    setResult(true);
  };

  // Opens the in-app ₹99 Razorpay checkout when configured; otherwise the live
  // kundli page (where the site creates the ₹99 order).
  const pay = () => { if (isRazorpayConfigured()) setPayOpen(true); else Linking.openURL(KUNDLI_FALLBACK_URL); };

  return (
    <Screen>
      {/* Header */}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.badge}>✦ VEDIC MATCH ENGINE</Text>
        <Text style={styles.h1}>Kundli Milan</Text>
        <Text style={styles.sub}>
          Two birth charts, one verdict. Get your Ashtakoota Guna Milan score out of 36 — and see exactly how each factor shapes your life together.
        </Text>
      </View>

      <PersonCard tag="Person 1" role="groom / self" data={p1} set={setP1} onTz={() => setTzFor(1)} />
      <PersonCard tag="Person 2" role="bride / partner" data={p2} set={setP2} onTz={() => setTzFor(2)} />

      {!result ? (
        <Animated.View entering={FadeInUp.duration(400)} style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <GradientButton label="♥  Calculate Match" onPress={calculate} style={{ paddingHorizontal: 8 }} />
          <Text style={styles.note}>
            If exact birth time is unknown, keep 12:00 — the Moon sign is correct on most days but may shift near a transition.
          </Text>
        </Animated.View>
      ) : paid ? (
        <Animated.View entering={FadeInDown.duration(450)} style={styles.locked}>
          <View style={[styles.lockCircle, { borderColor: colors.gold }]}><Ionicons name="checkmark" size={28} color={colors.gold} /></View>
          <Text style={styles.lockTitle}>Payment received ✨</Text>
          <Text style={styles.lockSub}>
            Thank you! Your full Ashtakoota report for {p1.name || 'Person 1'} & {p2.name || 'Person 2'} is being prepared and will be emailed to {email || 'your inbox'} shortly.
          </Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(450)} style={styles.locked}>
          <View style={styles.lockCircle}><Ionicons name="lock-closed" size={26} color={colors.gold} /></View>
          <Text style={styles.lockTitle}>Your Kundli Milan is ready</Text>
          <Text style={styles.lockSub}>
            Unlock your full compatibility result for just ₹{PRICES.kundli} — the score out of 36, the 8-koota breakdown, dosha analysis and a detailed report emailed to you.
          </Text>

          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}

          <TextInput
            style={styles.email}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <GradientButton label={`Pay ₹${PRICES.kundli} & Reveal Result`} onPress={pay} style={{ alignSelf: 'stretch', marginTop: spacing.sm }} />
          <Text style={styles.secure}>Secure payment via Razorpay · Instant delivery</Text>
        </Animated.View>
      )}

      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

      {/* Timezone picker */}
      <Modal visible={tzFor !== null} transparent animationType="fade" onRequestClose={() => setTzFor(null)}>
        <View style={styles.tzBackdrop}>
          {/* Tap-outside-to-close sits BEHIND the sheet so sheet taps don't close it */}
          <PressableScale to={1} onPress={() => setTzFor(null)} style={StyleSheet.absoluteFill} />
          <View style={styles.tzSheet}>
            <Text style={styles.tzTitle}>Birth timezone</Text>
            {TIMEZONES.map((tz, i) => (
              <PressableScale key={i} to={0.98} onPress={() => pickTz(i)} style={styles.tzRow}>
                <Text style={styles.tzText}>{tz}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </PressableScale>
            ))}
          </View>
        </View>
      </Modal>

      <RazorpayCheckout
        visible={payOpen}
        amount={PRICES.kundli}
        description="Kundli Milan — full Ashtakoota report"
        prefill={{ name: p1.name, email, contact: (user && user.phone) || '' }}
        onSuccess={() => { setPayOpen(false); setPaid(true); }}
        onClose={() => setPayOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { color: colors.gold, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1.5 },
  h1: { color: colors.text, fontFamily: serif, fontSize: font.display, fontWeight: '700', marginTop: spacing.xs },
  sub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

  person: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.xl },
  personTag: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700' },
  personRole: { color: colors.textMuted, fontSize: font.small, fontWeight: '400' },

  label: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgCardSolid, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 4 },
  input: { flex: 1, color: colors.text, fontSize: font.body, paddingVertical: 10 },
  hint: { color: colors.textMuted, fontSize: font.tiny, fontStyle: 'italic', marginTop: 4 },

  note: { color: colors.textMuted, fontSize: font.small, fontStyle: 'italic', textAlign: 'center', marginTop: spacing.md, lineHeight: 20 },

  locked: { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.xl, marginTop: spacing.xl, alignItems: 'center' },
  lockCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  lockTitle: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700', marginTop: spacing.md, textAlign: 'center' },
  lockSub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.md },
  benefitText: { color: colors.text, fontSize: font.small, flex: 1, lineHeight: 20 },
  email: { alignSelf: 'stretch', backgroundColor: colors.bgCardSolid, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: font.body, marginTop: spacing.lg },
  secure: { color: colors.textMuted, fontSize: font.tiny, marginTop: spacing.sm },

  disclaimer: { color: colors.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.xl, lineHeight: 17, opacity: 0.8 },

  tzBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.lg },
  tzSheet: { backgroundColor: '#160d24', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.panelBorder, padding: spacing.md },
  tzTitle: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700', margin: spacing.sm },
  tzRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  tzText: { color: colors.text, fontSize: font.body },
});
