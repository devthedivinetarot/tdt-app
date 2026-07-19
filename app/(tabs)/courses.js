import React, { useState } from 'react';
import { View, Text, Image, Modal, ScrollView, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '../../src/components/Screen';
import GradientButton from '../../src/components/GradientButton';
import OutlineButton from '../../src/components/OutlineButton';
import PressableScale from '../../src/components/PressableScale';
import { COURSES, COURSE_NOTE } from '../../src/data/courses';
import { colors, spacing, radius, font, serif } from '../../src/theme';

function CourseCard({ course, index, onDetails, onEnrol }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(500)} style={styles.card}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: course.image }} style={styles.img} resizeMode="cover" />
        <View style={[styles.badge, { backgroundColor: course.accent }]}>
          <Text style={styles.badgeText}>{course.level}</Text>
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{course.price}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{course.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={3}>{course.desc}</Text>
      <View style={styles.actions}>
        <GradientButton label="Enrol Now" onPress={() => onEnrol(course)} style={styles.enrolBtn} />
        <OutlineButton label="Course Details" onPress={() => onDetails(course)} style={styles.detailsBtn} />
      </View>
    </Animated.View>
  );
}

export default function Courses() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const enrol = (course) => Linking.openURL(course.enrol);

  return (
    <Screen>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.h1}>Choose Your <Text style={{ color: colors.gold }}>Path</Text></Text>
        <Text style={styles.h1sub}>Five carefully crafted courses to awaken your intuition and skill.</Text>
      </View>

      {COURSES.map((c, i) => (
        <CourseCard key={c.id} course={c} index={i} onDetails={setSelected} onEnrol={enrol} />
      ))}

      {/* Course Details modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalImgWrap}>
                  <Image source={{ uri: selected.image }} style={styles.modalImg} resizeMode="cover" />
                  <View style={[styles.badge, styles.modalBadge, { backgroundColor: selected.accent }]}>
                    <Text style={styles.badgeText}>{selected.level}</Text>
                  </View>
                  <PressableScale style={styles.closeX} onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </PressableScale>
                </View>

                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>{selected.title}</Text>
                  <View style={styles.pricePill}><Text style={styles.priceText}>{selected.price}</Text></View>
                </View>

                <Text style={[styles.sectionLabel, { color: selected.accent }]}>— WHAT YOU'LL LEARN</Text>
                {selected.learn.map((l, i) => (
                  <View key={i} style={styles.li}>
                    <Text style={[styles.bullet, { color: selected.accent }]}>✦</Text>
                    <Text style={styles.liText}>{l}</Text>
                  </View>
                ))}

                <Text style={[styles.sectionLabel, { color: selected.accent }]}>— WHAT YOU'LL NEED</Text>
                {selected.need.map((l, i) => (
                  <View key={i} style={styles.li}>
                    <Text style={[styles.bullet, { color: selected.accent }]}>◆</Text>
                    <Text style={styles.liText}>{l}</Text>
                  </View>
                ))}

                <View style={styles.note}>
                  <Text style={styles.noteText}>{COURSE_NOTE}</Text>
                </View>

                <GradientButton label="Enrol Now ✨" onPress={() => enrol(selected)} style={{ alignSelf: 'stretch', marginTop: spacing.md }} />
                <OutlineButton label="Close" onPress={() => setSelected(null)} style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.lg }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontFamily: serif, fontSize: font.display, fontWeight: '700', textAlign: 'center' },
  h1sub: { color: colors.textMuted, fontSize: font.body, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },

  card: { backgroundColor: colors.bgCard, borderRadius: radius.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  imgWrap: { width: '100%', height: 200, backgroundColor: colors.bgCardSolid },
  img: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: spacing.md, left: spacing.md, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: '#fff', fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5 },
  pricePill: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6, position: 'absolute', right: spacing.md, bottom: spacing.md },
  priceText: { color: '#1a1206', fontWeight: '800', fontSize: font.small },
  cardTitle: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700', marginTop: spacing.md, marginHorizontal: spacing.lg },
  cardDesc: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.sm, marginHorizontal: spacing.lg, lineHeight: 20 },
  actions: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm, margin: spacing.lg, marginTop: spacing.md },
  enrolBtn: { flex: 1 },
  detailsBtn: { flex: 1 },

  // Modal
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.lg },
  modal: { backgroundColor: '#160d24', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.panelBorder, maxHeight: '88%', overflow: 'hidden' },
  modalImgWrap: { width: '100%', height: 150, backgroundColor: colors.bgCardSolid },
  modalImg: { width: '100%', height: '100%' },
  modalBadge: { top: spacing.md, left: spacing.md },
  closeX: { position: 'absolute', top: spacing.md, right: spacing.md, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  modalTitle: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700', flex: 1 },
  sectionLabel: { fontSize: font.small, fontWeight: '800', letterSpacing: 1, marginTop: spacing.lg, marginHorizontal: spacing.lg },
  li: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginHorizontal: spacing.lg },
  bullet: { fontSize: font.small, marginTop: 1 },
  liText: { color: colors.text, fontSize: font.body, flex: 1, lineHeight: 22 },
  note: { backgroundColor: 'rgba(233,196,106,0.08)', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(233,196,106,0.25)', padding: spacing.md, margin: spacing.lg },
  noteText: { color: colors.textMuted, fontSize: font.small, lineHeight: 20 },
  modalClose: { alignItems: 'center', paddingVertical: spacing.md, margin: spacing.lg, marginTop: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  modalCloseText: { color: colors.text, fontWeight: '700', fontSize: font.body },
});
