import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n';
import PressableScale from './PressableScale';
import { colors, radius, font } from '../theme';

// Compact one-tap language toggle: cycles English -> हिंदी -> Hinglish.
const SHORT = { en: 'EN', hi: 'हि', hinglish: 'Hi' };

export default function LangButton({ style }) {
  const { lang, setLang } = useLanguage();

  const cycle = () => {
    const idx = LANGUAGES.findIndex((l) => l.code === lang);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    setLang(next.code);
  };

  return (
    <PressableScale onPress={cycle} to={0.88} style={[styles.btn, style]}>
      <Ionicons name="language" size={14} color={colors.gold} />
      <Text style={styles.txt}>{SHORT[lang] || 'EN'}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20,13,28,0.8)',
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  txt: { color: colors.gold, fontWeight: '800', fontSize: font.small },
});
