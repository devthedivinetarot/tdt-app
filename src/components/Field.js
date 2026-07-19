import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, spacing, radius, font } from '../theme';

function Label({ children }) {
  return <Text style={s.label}>{children}</Text>;
}

export function InputField({ label, icon, iconRight, value, onChangeText, placeholder, keyboardType, autoCapitalize }) {
  return (
    <View style={{ marginTop: spacing.md }}>
      {label ? <Label>{label}</Label> : null}
      <View style={s.field}>
        {icon ? <Ionicons name={icon} size={18} color={colors.gold} /> : null}
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {iconRight ? <Ionicons name={iconRight} size={18} color={colors.gold} /> : null}
      </View>
    </View>
  );
}

export function SelectField({ label, icon, value, placeholder, options, onSelect, title }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ marginTop: spacing.md }}>
      {label ? <Label>{label}</Label> : null}
      <PressableScale to={0.98} onPress={() => setOpen(true)} style={s.field}>
        {icon ? <Ionicons name={icon} size={18} color={colors.gold} /> : null}
        <Text style={[s.input, { color: current ? colors.text : colors.textMuted }]}>
          {current ? current.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.gold} />
      </PressableScale>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.backdrop}>
          <PressableScale to={1} onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{title || label}</Text>
            {options.map((o) => (
              <PressableScale key={o.value} to={0.98} onPress={() => { onSelect(o.value); setOpen(false); }} style={s.row}>
                <Text style={[s.rowText, value === o.value && { color: colors.gold, fontWeight: '800' }]}>{o.label}</Text>
                {value === o.value ? <Ionicons name="checkmark" size={18} color={colors.gold} /> : null}
              </PressableScale>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCardSolid,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, color: colors.text, fontSize: font.body, paddingVertical: 13 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: '#160d24', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.panelBorder, padding: spacing.md },
  sheetTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', margin: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  rowText: { color: colors.text, fontSize: font.body },
});
