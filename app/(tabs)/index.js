import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, FadeIn,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';

import Screen from '../../src/components/Screen';
import GradientButton from '../../src/components/GradientButton';
import CardOfDay from '../../src/components/CardOfDay';
import Shimmer from '../../src/components/Shimmer';
import TarotImage from '../../src/components/TarotImage';
import { ASSETS } from '../../src/assets';
import { SAMPLE } from '../../src/data/cards';
import { TESTIMONIALS } from '../../src/data/testimonials';
import { colors, gradients, serif, spacing, radius, font, IS_WEB } from '../../src/theme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

// Gently floating hero logo (native only — web stays still to avoid main-thread loops).
function FloatingLogo({ source, style }) {
  const y = useSharedValue(0);
  React.useEffect(() => {
    if (IS_WEB) return;
    y.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []); // eslint-disable-line
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * y.value }] }));
  return <AnimatedImage source={source} style={[style, st]} resizeMode="contain" />;
}

// Counts a leading number up from 0 (e.g. "10,000+ readings", "4.9 rating").
// Falls back to static text when the label doesn't start with a number.
function CountText({ label, style }) {
  const m = /^([\d.,]+)(\+?)([\s\S]*)$/.exec(label || '');
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!m) return;
    const target = parseFloat(m[1].replace(/,/g, '')) || 0;
    const start = Date.now(), dur = 1100;
    let raf;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick); else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [label]); // eslint-disable-line
  if (!m) return <Text style={style}>{label}</Text>;
  const decimals = (m[1].split('.')[1] || '').length;
  const num = m[1].includes(',') ? Math.round(val).toLocaleString('en-US') : val.toFixed(decimals);
  return <Text style={style}>{num}{m[2]}{m[3]}</Text>;
}

const SCREEN_H = Dimensions.get('window').height; // hero banner = 60% of this

// 3-column flex grid ------------------------------------------------------
function Grid({ children }) {
  return <View style={styles.grid}>{children}</View>;
}

function GridCell({ icon, title, desc, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={styles.cell}>
      <LinearGradient
        colors={['rgba(233,196,106,0.22)', 'rgba(150,90,230,0.16)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.cellIcon}
      >
        <Ionicons name={icon} size={22} color={colors.gold} />
      </LinearGradient>
      <Text style={styles.cellTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.cellDesc} numberOfLines={3}>{desc}</Text>
    </Animated.View>
  );
}

function SectionHeading({ children, sub }) {
  return (
    <View style={{ alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.lg }}>
      <Text style={styles.h2}>{children}</Text>
      {sub ? <Text style={styles.h2sub}>{sub}</Text> : null}
    </View>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();

  const stuck = [
    { icon: 'moon-outline', t: t('stuck1_t'), d: t('stuck1_d') },
    { icon: 'heart-outline', t: t('stuck2_t'), d: t('stuck2_d') },
    { icon: 'compass-outline', t: t('stuck3_t'), d: t('stuck3_d') },
  ];
  const steps = [
    { icon: 'chatbubble-outline', t: t('step_ask_title'), d: t('step_ask_desc') },
    { icon: 'sparkles-outline', t: t('step_pick_title'), d: t('step_pick_desc') },
    { icon: 'eye-outline', t: t('step_reveal_title'), d: t('step_reveal_desc') },
  ];
  const feats = [
    { icon: 'planet-outline', t: t('feat1_t'), d: t('feat1_d') },
    { icon: 'flash-outline', t: t('feat2_t'), d: t('feat2_d') },
    { icon: 'heart-outline', t: t('feat3_t'), d: t('feat3_d') },
  ];
  const stats = [
    { icon: 'sparkles', label: t('stat_readings'), pink: false },
    { icon: 'heart', label: t('stat_rating'), pink: true },
    { icon: 'flash', label: t('stat_speed'), pink: false },
  ];

  return (
    <Screen>
      {/* Header with exact logo (language toggle floats top-right globally) */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={{ uri: ASSETS.logo }} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.brand}>{t('app_name')}</Text>
            <Text style={styles.brandSub}>{t('tagline')}</Text>
          </View>
        </View>
      </View>

      {/* Hero banner with the exact img.png */}
      <Animated.View entering={FadeInUp.duration(600)}>
        <View style={styles.banner}>
          <Image source={{ uri: ASSETS.hero }} style={styles.bannerImg} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(11,7,16,0.35)', colors.bg]}
            style={StyleSheet.absoluteFill}
          />
          <FloatingLogo source={{ uri: ASSETS.logo }} style={styles.bannerLogo} />
        </View>

        <Text style={styles.heroIntro}>{t('hero_intro')}</Text>
        <Text style={styles.heroTitle}>{t('home_hero')}</Text>
        <GradientButton
          label={t('cta_know_fortune')}
          onPress={() => router.push('/reading')}
          style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
        />
        <Text style={styles.maybe}>{t('maybe_answer')}</Text>
      </Animated.View>

      {/* Card of the Day — interactive daily flip + streak */}
      <CardOfDay />

      {/* Feeling stuck — 3-col grid */}
      <View style={{ marginTop: spacing.xl }}>
        <Grid>
          {stuck.map((s, i) => (
            <GridCell key={i} icon={s.icon} title={s.t} desc={s.d} delay={i * 90} />
          ))}
        </Grid>
      </View>

      {/* How it works — 3-col grid */}
      <SectionHeading sub={t('how_sub')}>{t('how_it_works')}</SectionHeading>
      <Grid>
        {steps.map((s, i) => (
          <GridCell key={i} icon={s.icon} title={s.t} desc={s.d} delay={i * 90} />
        ))}
      </Grid>

      {/* Cards Ka Message — the one purple panel */}
      <LinearGradient colors={gradients.panel} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.panel}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{t('reader_intro')}</Text>
        </View>

        <View style={styles.msgTitleRow}>
          <View style={styles.msgDivider} />
          <Text style={styles.msgTitle}>✨ {t('cards_message')}</Text>
          <View style={styles.msgDivider} />
        </View>

        <View style={styles.cardGrid}>
          {SAMPLE.map((c, i) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(i * 120).duration(500)} style={styles.tarot}>
              <View style={styles.tarotImgWrap}>
                <TarotImage uri={c.image} name={c.name} style={styles.tarotImg} />
                <Shimmer delay={i * 500} />
              </View>
              <Text style={styles.tarotName} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.tarotMsg} numberOfLines={5}>{c.message}</Text>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.gTitle}>✦ {t('guidance_title')}</Text>
        <Text style={styles.gLine}>{t('guidance_line1')}</Text>
        <Text style={styles.gLine}>{t('guidance_line2')}</Text>
        <Text style={styles.gLine}>{t('guidance_line3')}</Text>
        <GradientButton
          label={t('reading_unlock_cta')}
          onPress={() => router.push('/reading')}
          style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
        />
        <Text style={styles.awaits}>{t('complete_awaits')}</Text>
      </LinearGradient>

      {/* Testimonials */}
      <SectionHeading sub={t('testi_sub')}>{t('testi_title')}</SectionHeading>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xs }}>
        {TESTIMONIALS.map((ts) => (
          <View key={ts.id} style={styles.testi}>
            <View style={styles.stars}>
              {[0, 1, 2, 3, 4].map((n) => (
                <Ionicons key={n} name="star" size={14} color={colors.star} />
              ))}
            </View>
            <Text style={styles.testiText}>“{ts.text}”</Text>
            <View style={styles.testiWho}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{ts.initial}</Text></View>
              <View>
                <Text style={styles.testiName}>{ts.name}</Text>
                <Text style={styles.testiRole}>Verified Reader</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Why The Divine Tarot */}
      <SectionHeading>{t('why_title')}</SectionHeading>
      <Text style={styles.whyBody}>{t('why_body')}</Text>
      <Text style={styles.whyBody2}>{t('why_body2')}</Text>
      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.statPill, s.pink && { borderColor: colors.ratingPink }]}>
            <Ionicons name={s.icon} size={14} color={s.pink ? colors.ratingPink : colors.gold} />
            <CountText label={s.label} style={[styles.statText, s.pink && { color: colors.ratingPink }]} />
          </View>
        ))}
      </View>

      {/* Feature cards — 3-col grid */}
      <View style={{ marginTop: spacing.lg }}>
        <Grid>
          {feats.map((f, i) => (
            <GridCell key={i} icon={f.icon} title={f.t} desc={f.d} delay={i * 80} />
          ))}
        </Grid>
      </View>

      {/* Final CTA */}
      <Animated.View entering={FadeIn.duration(700)} style={styles.final}>
        <Text style={styles.finalStar}>✦</Text>
        <Text style={styles.finalTitle}>{t('final_cta_title')}</Text>
        <Text style={styles.finalSub}>{t('final_cta_sub')}</Text>
        <GradientButton
          label={`${t('final_cta_btn')}  →`}
          onPress={() => router.push('/reading')}
          style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
        />
        <Text style={styles.finalFree}>{t('final_cta_free')}</Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 38, height: 38, borderRadius: 8 },
  brand: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700' },
  brandSub: { color: colors.gold, fontSize: 9, letterSpacing: 1.4, fontWeight: '700', marginTop: 2 },

  banner: { width: '100%', height: SCREEN_H * 0.6, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  bannerImg: { width: '100%', height: '100%' },
  bannerLogo: { position: 'absolute', top: spacing.md, left: spacing.md, width: 40, height: 40 },

  heroIntro: { color: colors.textMuted, fontSize: font.body, textAlign: 'center', fontStyle: 'italic', marginTop: spacing.lg },
  heroTitle: { color: colors.text, fontFamily: serif, fontSize: font.display, fontWeight: '700', textAlign: 'center', lineHeight: 42, marginTop: spacing.md },
  maybe: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.md },

  // 3-column grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: '31.5%', backgroundColor: colors.bgCard, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', minHeight: 140 },
  cellIcon: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  cellTitle: { color: colors.text, fontFamily: serif, fontSize: font.small, fontWeight: '700', textAlign: 'center' },
  cellDesc: { color: colors.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: 4, lineHeight: 15 },

  h2: { color: colors.text, fontFamily: serif, fontSize: font.h1, fontWeight: '700', textAlign: 'center' },
  h2sub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, textAlign: 'center' },

  panel: { borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.xxl, borderWidth: 1, borderColor: colors.panelBorder },
  bubble: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  bubbleText: { color: '#efe7ff', fontSize: font.small, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
  msgTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginVertical: spacing.lg },
  msgDivider: { flex: 1, height: 1, backgroundColor: 'rgba(233,196,106,0.4)' },
  msgTitle: { color: colors.gold, fontSize: font.body, fontWeight: '800', letterSpacing: 1 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarot: { width: '31.5%', backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  tarotImgWrap: { width: '100%', aspectRatio: 0.58, borderRadius: radius.sm, overflow: 'hidden' },
  tarotImg: { width: '100%', height: '100%', borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  tarotName: { color: colors.gold, fontFamily: serif, fontSize: font.small, fontWeight: '700', marginTop: spacing.sm, textAlign: 'center' },
  tarotMsg: { color: '#d9cff0', fontSize: font.tiny, textAlign: 'center', marginTop: spacing.xs, lineHeight: 14, fontStyle: 'italic' },
  gTitle: { color: colors.gold, fontFamily: serif, fontSize: font.h3, fontWeight: '700', marginTop: spacing.sm, textAlign: 'center' },
  gLine: { color: '#d9cff0', fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  awaits: { color: colors.gold, fontSize: font.small, textAlign: 'center', marginTop: spacing.md },

  testi: { width: 270, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  stars: { flexDirection: 'row', gap: 3, marginBottom: spacing.sm },
  testiText: { color: colors.text, fontSize: font.small, lineHeight: 20, fontStyle: 'italic' },
  testiWho: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.gold, fontWeight: '800' },
  testiName: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  testiRole: { color: colors.textMuted, fontSize: font.tiny },

  whyBody: { color: colors.text, fontSize: font.body, lineHeight: 24, textAlign: 'center' },
  whyBody2: { color: colors.textMuted, fontSize: font.small, lineHeight: 22, textAlign: 'center', marginTop: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  statText: { color: colors.gold, fontSize: font.small, fontWeight: '700' },

  final: { alignItems: 'center', marginTop: spacing.xxl },
  finalStar: { fontSize: 34, color: colors.gold, marginBottom: spacing.md },
  finalTitle: { color: colors.text, fontFamily: serif, fontSize: font.h1, fontWeight: '700', textAlign: 'center' },
  finalSub: { color: colors.textMuted, fontSize: font.body, textAlign: 'center', marginTop: spacing.sm },
  finalFree: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.md },
});
