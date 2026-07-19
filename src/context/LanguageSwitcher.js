import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from './LanguageContext';
import { LANGUAGES } from '../i18n';
import PressableScale from '../components/PressableScale';
import { colors, radius } from '../theme';

// Compact 3-way language toggle: English / हिंदी / Hinglish (animated pills)
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <View style={styles.row}>
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <PressableScale key={l.code} to={0.9} onPress={() => setLang(l.code)} style={[styles.pill, active && styles.pillActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{l.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: colors.bgCard,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  pill: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: radius.pill },
  pillActive: { backgroundColor: colors.gold },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  labelActive: { color: '#1a1206', fontWeight: '800' },
});
