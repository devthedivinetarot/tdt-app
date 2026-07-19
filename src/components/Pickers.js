import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import GradientButton from './GradientButton';
import { colors, spacing, radius, font, serif } from '../theme';

/* ============================ helpers ============================ */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEAR_MIN = 1930;
const YEAR_MAX = new Date().getFullYear();
const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => String(YEAR_MIN + i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

const daysInMonth = (mIdx, year) => new Date(year, mIdx + 1, 0).getDate();
const pad = (n) => String(n).padStart(2, '0');

function parseDate(str) {
  if (!str) return null;
  let m;
  if ((m = str.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/))) {
    const mi = MONTHS.findIndex((x) => x.toLowerCase() === m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) return { d: +m[1], mi, y: +m[3] };
  }
  if ((m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/))) return { d: +m[1], mi: +m[2] - 1, y: +m[3] };
  if ((m = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/))) return { d: +m[3], mi: +m[2] - 1, y: +m[1] };
  return null;
}
const fmtDate = (d, mi, y) => `${pad(d)} ${MONTHS[mi]} ${y}`;

function parseTime(str) {
  if (!str) return null;
  let m;
  if ((m = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i))) {
    return { h: +m[1], min: +m[2], period: m[3].toUpperCase() };
  }
  if ((m = str.match(/^(\d{1,2}):(\d{2})$/))) {
    let h = +m[1];
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return { h, min: +m[2], period };
  }
  return null;
}
const fmtTime = (h, min, period) => `${pad(h)}:${pad(min)} ${period}`;

/* ============================ Wheel ============================ */
const ITEM_H = 42;
const VISIBLE = 5;
const WHEEL_H = ITEM_H * VISIBLE;

function Wheel({ items, initialIndex, onChange, flex = 1 }) {
  const ref = useRef(null);
  const [sel, setSel] = useState(initialIndex);

  useEffect(() => {
    const t = setTimeout(() => {
      if (ref.current) ref.current.scrollTo({ y: initialIndex * ITEM_H, animated: false });
    }, 20);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const handle = (y) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM_H)));
    if (i !== sel) { setSel(i); onChange(i); }
  };

  return (
    <View style={{ flex, height: WHEEL_H }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={(e) => handle(e.nativeEvent.contentOffset.y)}
        onMomentumScrollEnd={(e) => handle(e.nativeEvent.contentOffset.y)}
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
      >
        {items.map((it, i) => (
          <View key={i} style={styles.wheelItem}>
            <Text style={[styles.wheelText, i === sel && styles.wheelTextActive]} numberOfLines={1}>{it}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function WheelRow({ children }) {
  return (
    <View style={styles.wheelRow}>
      {/* gold selection band across all columns */}
      <View pointerEvents="none" style={styles.band} />
      {children}
    </View>
  );
}

/* ======================= Bottom sheet shell ======================= */
function Sheet({ visible, onClose, title, subtitle, onSet, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <PressableScale to={1} onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <LinearGradient colors={[colors.gold, '#f3d98c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sheetTop} />
          <View style={styles.grab} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sheetSub}>{subtitle}</Text> : null}
          {children}
          <View style={styles.sheetActions}>
            <PressableScale to={0.97} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </PressableScale>
            <GradientButton label="Set" onPress={onSet} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ======================= Trigger field ======================= */
function FieldTrigger({ label, icon, filled, text, placeholder, onPress }) {
  return (
    <View style={{ marginTop: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <PressableScale to={0.98} onPress={onPress} style={styles.field}>
        {icon ? <Ionicons name={icon} size={18} color={colors.gold} /> : null}
        <Text style={[styles.fieldText, { color: filled ? colors.text : colors.textMuted }]}>
          {filled ? text : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.gold} />
      </PressableScale>
    </View>
  );
}

/* ======================= DatePickerField ======================= */
export function DatePickerField({ label, icon = 'calendar-outline', value, onChange, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false);
  const parsed = parseDate(value);
  const [d, setD] = useState((parsed ? parsed.d : 1) - 1);
  const [mi, setMi] = useState(parsed ? parsed.mi : 0);
  const [yi, setYi] = useState(parsed ? Math.max(0, parsed.y - YEAR_MIN) : YEARS.indexOf('2000'));

  const openSheet = () => {
    const p = parseDate(value);
    if (p) { setD(p.d - 1); setMi(p.mi); setYi(Math.max(0, p.y - YEAR_MIN)); }
    setOpen(true);
  };
  const commit = () => {
    const year = YEAR_MIN + yi;
    const maxD = daysInMonth(mi, year);
    const day = Math.min(d + 1, maxD);
    onChange(fmtDate(day, mi, year));
    setOpen(false);
  };

  return (
    <>
      <FieldTrigger label={label} icon={icon} filled={!!value} text={value} placeholder={placeholder} onPress={openSheet} />
      <Sheet visible={open} onClose={() => setOpen(false)} onSet={commit} title="Date of Birth" subtitle="Scroll to your birth date">
        <WheelRow>
          <Wheel items={DAYS} initialIndex={d} onChange={setD} />
          <Wheel items={MONTHS} initialIndex={mi} onChange={setMi} flex={1.2} />
          <Wheel items={YEARS} initialIndex={yi} onChange={setYi} />
        </WheelRow>
      </Sheet>
    </>
  );
}

/* ======================= TimePickerField ======================= */
export function TimePickerField({ label, icon = 'time-outline', value, onChange, placeholder = 'Select time' }) {
  const [open, setOpen] = useState(false);
  const p0 = parseTime(value);
  const [hi, setHi] = useState(p0 ? p0.h - 1 : 11);          // default 12
  const [min, setMin] = useState(p0 ? p0.min : 0);
  const [per, setPer] = useState(p0 ? PERIODS.indexOf(p0.period) : 1); // default PM

  const openSheet = () => {
    const p = parseTime(value);
    if (p) { setHi(p.h - 1); setMin(p.min); setPer(PERIODS.indexOf(p.period)); }
    setOpen(true);
  };
  const commit = () => {
    onChange(fmtTime(hi + 1, min, PERIODS[per]));
    setOpen(false);
  };

  return (
    <>
      <FieldTrigger label={label} icon={icon} filled={!!value} text={value} placeholder={placeholder} onPress={openSheet} />
      <Sheet visible={open} onClose={() => setOpen(false)} onSet={commit} title="Time of Birth" subtitle="As close as you know — 12:00 PM if unsure">
        <WheelRow>
          <Wheel items={HOURS} initialIndex={hi} onChange={setHi} />
          <Wheel items={MINUTES} initialIndex={min} onChange={setMin} />
          <Wheel items={PERIODS} initialIndex={per} onChange={setPer} />
        </WheelRow>
      </Sheet>
    </>
  );
}

/* ======================= PlacePickerField ======================= */
const CITIES = [
  'Agra','Ahmedabad','Ajmer','Aligarh','Allahabad (Prayagraj)','Amravati','Amritsar','Aurangabad','Bengaluru','Bareilly',
  'Bhopal','Bhubaneswar','Bikaner','Chandigarh','Chennai','Coimbatore','Cuttack','Dehradun','Delhi','Dhanbad',
  'Durgapur','Faridabad','Firozabad','Gaya','Ghaziabad','Goa (Panaji)','Gorakhpur','Guntur','Gurugram','Guwahati',
  'Gwalior','Haldwani','Hisar','Howrah','Hyderabad','Indore','Jabalpur','Jaipur','Jalandhar','Jammu',
  'Jamnagar','Jamshedpur','Jhansi','Jodhpur','Kanpur','Kochi','Kolhapur','Kolkata','Kota','Kozhikode',
  'Lucknow','Ludhiana','Madurai','Mangaluru','Meerut','Moradabad','Mumbai','Muzaffarpur','Mysuru','Nagpur',
  'Nanded','Nashik','Navi Mumbai','Nellore','Noida','Patiala','Patna','Pune','Raipur','Rajkot',
  'Ranchi','Rourkela','Saharanpur','Salem','Sangli','Shimla','Siliguri','Solapur','Srinagar','Surat',
  'Thane','Thiruvananthapuram','Thrissur','Tiruchirappalli','Tirupati','Udaipur','Ujjain','Vadodara','Varanasi','Vasai-Virar',
  'Vijayawada','Visakhapatnam','Warangal',
  // World metros for NRIs
  'Dubai, UAE','Abu Dhabi, UAE','Doha, Qatar','Riyadh, Saudi Arabia','London, UK','Manchester, UK','New York, USA',
  'New Jersey, USA','San Francisco, USA','Toronto, Canada','Sydney, Australia','Melbourne, Australia','Singapore','Kathmandu, Nepal',
];

export function PlacePickerField({ label, icon = 'location-outline', value, onChange, placeholder = 'Select city' }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(s));
  }, [q]);

  const choose = (c) => { onChange(c); setOpen(false); setQ(''); };

  return (
    <>
      <FieldTrigger label={label} icon={icon} filled={!!value} text={value} placeholder={placeholder} onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <PressableScale to={1} onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={[styles.sheet, { height: '78%' }]}>
            <LinearGradient colors={[colors.gold, '#f3d98c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sheetTop} />
            <View style={styles.grab} />
            <Text style={styles.sheetTitle}>Birth Place</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={q}
                onChangeText={setQ}
                placeholder="Search your city…"
                placeholderTextColor={colors.textMuted}
                autoFocus={Platform.OS === 'web'}
              />
              {q ? (
                <PressableScale to={0.9} onPress={() => setQ('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </PressableScale>
              ) : null}
            </View>

            <ScrollView style={{ flex: 1, marginTop: spacing.sm }} keyboardShouldPersistTaps="handled">
              {q.trim() && !results.some((c) => c.toLowerCase() === q.trim().toLowerCase()) ? (
                <PressableScale to={0.98} onPress={() => choose(q.trim())} style={styles.cityRow}>
                  <Ionicons name="add-circle-outline" size={18} color={colors.gold} />
                  <Text style={[styles.cityText, { color: colors.gold }]}>Use “{q.trim()}”</Text>
                </PressableScale>
              ) : null}
              {results.map((c) => (
                <PressableScale key={c} to={0.98} onPress={() => choose(c)} style={styles.cityRow}>
                  <Ionicons name="location-outline" size={16} color={value === c ? colors.gold : colors.textMuted} />
                  <Text style={[styles.cityText, value === c && { color: colors.gold, fontWeight: '800' }]}>{c}</Text>
                  {value === c ? <Ionicons name="checkmark" size={18} color={colors.gold} /> : null}
                </PressableScale>
              ))}
              {results.length === 0 ? <Text style={styles.noRes}>No match — type your city and tap “Use …”.</Text> : null}
              <View style={{ height: spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ============================ styles ============================ */
const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgCardSolid, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 13,
  },
  fieldText: { flex: 1, fontSize: font.body },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#160d24', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    borderWidth: 1, borderColor: colors.panelBorder, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  sheetTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginTop: spacing.md, marginBottom: spacing.sm },
  sheetTitle: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700', textAlign: 'center' },
  sheetSub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: 4, marginBottom: spacing.sm },

  wheelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: WHEEL_H, marginTop: spacing.sm },
  band: {
    position: 'absolute', left: 0, right: 0, top: ITEM_H * 2, height: ITEM_H,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gold,
    backgroundColor: 'rgba(233,196,106,0.08)', borderRadius: 8,
  },
  wheelItem: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  wheelText: { color: colors.textMuted, fontSize: 16, fontWeight: '500' },
  wheelTextActive: { color: colors.gold, fontSize: 21, fontWeight: '800' },

  sheetActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textMuted, fontSize: font.body, fontWeight: '700' },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm,
    backgroundColor: colors.bgCardSolid, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 11,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: font.body },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 13, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  cityText: { flex: 1, color: colors.text, fontSize: font.body },
  noRes: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.lg, fontStyle: 'italic' },
});
