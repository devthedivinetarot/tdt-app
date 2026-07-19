import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Screen from '../src/components/Screen';
import GradientButton from '../src/components/GradientButton';
import OutlineButton from '../src/components/OutlineButton';
import { drawThree } from '../src/data/cards';
import { colors, spacing, radius, font, serif } from '../src/theme';

export default function ReadingResult() {
  const { t } = useTranslation();
  const router = useRouter();

  // Dev build draws locally. Production: call your reading API here.
  const cards = useMemo(() => drawThree(), []);

  return (
    <Screen>
      <Text style={styles.title}>✨ {t('reading_reveal_title')}</Text>

      {cards.map((c, i) => (
        <Animated.View key={c.id} entering={FadeInDown.delay(i * 120).duration(500)} style={styles.card}>
          <Image source={{ uri: c.image }} style={styles.cardImg} resizeMode="cover" />
          <Text style={styles.name}>{c.name}</Text>
          <Text style={styles.msg}>{c.message}</Text>
        </Animated.View>
      ))}

      <Text style={styles.gTitle}>✦ {t('reading_guidance')}</Text>
      <Text style={styles.gBody}>{t('guidance_line1')}</Text>

      {/* Locked premium — payment wired in Phase 3 */}
      <View style={styles.locked}>
        <Text style={styles.lockedText}>🔒 {t('reading_locked')}</Text>
        <GradientButton
          label={t('reading_unlock_cta')}
          onPress={() => router.replace('/reading')}
          style={{ alignSelf: 'stretch' }}
        />
      </View>

      <OutlineButton label={t('restart')} onPress={() => router.replace('/reading')} style={styles.restart} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700', marginBottom: spacing.lg, textAlign: 'center' },
  card: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cardImg: { width: 130, height: 216, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  name: { color: colors.gold, fontFamily: serif, fontSize: font.h3, fontWeight: '700', marginTop: spacing.md },
  msg: { color: colors.textMuted, fontSize: font.body, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22, fontStyle: 'italic' },
  gTitle: { color: colors.gold, fontFamily: serif, fontSize: font.h3, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' },
  gBody: { color: colors.textMuted, fontSize: font.body, marginTop: spacing.sm, lineHeight: 22, textAlign: 'center' },
  locked: { backgroundColor: colors.bgCardSolid, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  lockedText: { color: colors.text, fontSize: font.body, marginBottom: spacing.md },
  restart: { alignSelf: 'center', marginTop: spacing.xl, paddingHorizontal: 28 },
});
