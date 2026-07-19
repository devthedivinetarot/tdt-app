import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, Switch, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import Screen from '../../src/components/Screen';
import GradientButton from '../../src/components/GradientButton';
import OutlineButton from '../../src/components/OutlineButton';
import PressableScale from '../../src/components/PressableScale';
import { InputField, SelectField } from '../../src/components/Field';
import { DatePickerField, TimePickerField, PlacePickerField } from '../../src/components/Pickers';
import { useAuth } from '../../src/context/AuthContext';
import { scheduleDailyReminders, cancelDailyReminders, previewReminder } from '../../src/notifications';
import { isOptedOut, setOptOut, isLocationEnabled, enableLocationLogging, disableLocationLogging } from '../../src/lib/analytics';
import { colors, spacing, radius, font, serif } from '../../src/theme';

export default function Profile() {
  const auth = useAuth();
  if (!auth || !auth.ready) {
    return <Screen scroll={false} contentStyle={{ justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.textMuted }}>…</Text></Screen>;
  }
  return auth.user ? <ProfileView /> : <AuthView />;
}

/* ----------------------------- AUTH ----------------------------- */
function AuthView() {
  const { t } = useTranslation();
  const { pendingPhone, signInWithGoogle, startPhoneOTP, verifyOTP, cancelPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');

  const google = async () => {
    setErr('');
    const ok = await signInWithGoogle();
    if (!ok) setErr('Google sign-in complete nahi hua — dobara try karein ya phone se login karein.');
  };
  const send = async () => {
    setErr('');
    const ok = await startPhoneOTP(phone);
    if (!ok) setErr('Number sahi hai? OTP bhejne mein dikkat aa rahi hai — dobara try karein.');
  };
  const verify = async () => {
    setErr('');
    const ok = await verifyOTP(otp);
    if (!ok) setErr('Enter the 6-digit code.');
  };

  return (
    <Screen contentStyle={{ justifyContent: 'center', flexGrow: 1 }}>
      <View style={styles.authHead}>
        <View style={styles.moon}><Ionicons name="moon" size={30} color={colors.gold} /></View>
        <Text style={styles.authTitle}>{t('auth_title')}</Text>
        <Text style={styles.authSub}>{t('auth_sub')}</Text>
      </View>

      {!pendingPhone ? (
        <>
          <PressableScale to={0.97} onPress={google} style={styles.google}>
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleText}>{t('continue_google')}</Text>
          </PressableScale>

          <View style={styles.orRow}>
            <View style={styles.orLine} /><Text style={styles.orText}>{t('or')}</Text><View style={styles.orLine} />
          </View>

          <Text style={styles.label}>{t('phone_label')}</Text>
          <View style={styles.phoneRow}>
            <View style={styles.cc}><Text style={styles.ccText}>+91</Text></View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder={t('phone_ph')}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
          <GradientButton label={t('send_otp')} onPress={send} style={{ alignSelf: 'stretch', marginTop: spacing.lg }} />
        </>
      ) : (
        <>
          <Text style={styles.otpTitle}>{t('otp_title')}</Text>
          <Text style={styles.otpSub}>{t('otp_sub')} +91 {pendingPhone}</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="••••••"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
          />
          <GradientButton label={t('verify_continue')} onPress={verify} style={{ alignSelf: 'stretch', marginTop: spacing.lg }} />
          <View style={styles.otpActions}>
            <PressableScale onPress={send}><Text style={styles.linkText}>{t('resend_otp')}</Text></PressableScale>
            <PressableScale onPress={cancelPhone}><Text style={styles.linkText}>{t('change_number')}</Text></PressableScale>
          </View>
        </>
      )}

      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Text style={styles.demoNote}>Real OTP via SMS · Google sign-in live.</Text>
    </Screen>
  );
}

/* --------------------------- PROFILE ---------------------------- */
function ProfileView() {
  const { t } = useTranslation();
  const { user, saveProfile, signOut } = useAuth();
  const p = user.profile || {};

  const [photo, setPhoto] = useState(p.photo || '');
  const [name, setName] = useState(user.name || '');
  const [gender, setGender] = useState(p.gender || '');
  const [birthplace, setBirthplace] = useState(p.birthplace || '');
  const [dob, setDob] = useState(p.dob || '');
  const [time, setTime] = useState(p.time || '');
  const [marital, setMarital] = useState(p.marital || '');
  const [occupation, setOccupation] = useState(p.occupation || '');
  const [status, setStatus] = useState('');

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled && res.assets && res.assets[0]) {
      const uri = res.assets[0].uri;
      setPhoto(uri);
      await saveProfile({ photo: uri }); // persist immediately
    }
  };

  // reminders
  const [notifOn, setNotifOn] = useState(false);
  useEffect(() => { AsyncStorage.getItem('notif.enabled').then((v) => setNotifOn(v === '1')); }, []);

  // privacy
  const [shareOn, setShareOn] = useState(true);
  const [locOn, setLocOn] = useState(false);
  useEffect(() => {
    isOptedOut().then((v) => setShareOn(!v));
    isLocationEnabled().then(setLocOn);
  }, []);
  const toggleShare = async (val) => { setShareOn(val); await setOptOut(!val); if (!val) { setLocOn(false); await disableLocationLogging(); } };
  const toggleLoc = async (val) => {
    if (val) { const ok = await enableLocationLogging(); setLocOn(ok); }
    else { setLocOn(false); await disableLocationLogging(); }
  };

  const genderOpts = [
    { value: 'male', label: t('opt_male') }, { value: 'female', label: t('opt_female') }, { value: 'other', label: t('opt_other') },
  ];
  const maritalOpts = [
    { value: 'single', label: t('opt_single') }, { value: 'married', label: t('opt_married') },
    { value: 'engaged', label: t('opt_engaged') }, { value: 'divorced', label: t('opt_divorced') }, { value: 'widowed', label: t('opt_widowed') },
  ];
  const occOpts = [
    { value: 'student', label: t('opt_student') }, { value: 'employee', label: t('opt_employee') },
    { value: 'self', label: t('opt_self') }, { value: 'business', label: t('opt_business') },
    { value: 'homemaker', label: t('opt_homemaker') }, { value: 'other', label: t('opt_occ_other') },
  ];

  const save = async () => {
    await saveProfile({ name, gender, birthplace, dob, time, marital, occupation, photo });
    setStatus(t('profile_saved'));
  };

  const toggleNotif = async (val) => {
    if (val) {
      const ok = await scheduleDailyReminders();
      setNotifOn(ok); await AsyncStorage.setItem('notif.enabled', ok ? '1' : '0');
    } else {
      setNotifOn(false); await AsyncStorage.setItem('notif.enabled', '0'); await cancelDailyReminders();
    }
  };

  const initial = (name || user.phone || 'T').trim().charAt(0).toUpperCase();

  return (
    <Screen>
      <Text style={styles.title}>{t('profile_title')}</Text>

      {/* Identity header */}
      <View style={styles.idCard}>
        <PressableScale to={0.94} onPress={pickPhoto} style={styles.avatarWrap}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
          )}
          <View style={styles.camBadge}><Ionicons name="camera" size={12} color="#1a1206" /></View>
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Text style={styles.idName} numberOfLines={1}>{name || (user.phone || 'Seeker')}</Text>
          <View style={styles.provRow}>
            <Ionicons name={user.provider === 'google' ? 'logo-google' : 'call'} size={12} color={colors.gold} />
            <Text style={styles.provText}>{user.provider === 'google' ? t('signed_google') : t('signed_phone')}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.intro}>{t('profile_intro')}</Text>

      {/* Astrologer-style profile form */}
      <InputField label={t('prof_name')} icon="person-outline" value={name} onChangeText={setName} placeholder="Your name" />
      <SelectField label={t('prof_gender')} icon="male-female-outline" value={gender} placeholder={t('sel_choose')} options={genderOpts} onSelect={setGender} />
      <PlacePickerField label={t('prof_birthplace')} value={birthplace} onChange={setBirthplace} placeholder={t('sel_choose')} />
      <DatePickerField label={t('prof_dob')} value={dob} onChange={setDob} placeholder={t('sel_choose')} />
      <TimePickerField label={t('prof_time')} value={time} onChange={setTime} placeholder={t('sel_choose')} />
      <SelectField label={t('prof_marital')} icon="heart-outline" value={marital} placeholder={t('sel_choose')} options={maritalOpts} onSelect={setMarital} />
      <SelectField label={t('prof_occupation')} icon="briefcase-outline" value={occupation} placeholder={t('sel_choose')} options={occOpts} onSelect={setOccupation} />

      <GradientButton label={t('save_profile')} onPress={save} style={{ alignSelf: 'stretch', marginTop: spacing.xl }} />
      {status ? <Text style={styles.saved}>{status}</Text> : null}

      {/* Daily reminders */}
      <Text style={styles.section}>Daily Tarot Reminders</Text>
      <View style={styles.notifBox}>
        <View style={styles.notifRow}>
          <View style={styles.notifIcon}><Ionicons name="notifications" size={20} color={colors.gold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>Aaj ki energy reminders</Text>
            <Text style={styles.notifSub}>Roz 3 baar — tumhari cards ka message yaad dilayenge.</Text>
          </View>
          <Switch value={notifOn} onValueChange={toggleNotif} trackColor={{ false: '#3a2f52', true: colors.gold }} thumbColor={notifOn ? '#fff' : '#cdbfe6'} />
        </View>
        <OutlineButton label="🔔 Preview a reminder" onPress={previewReminder} style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
      </View>

      {/* Privacy */}
      <Text style={styles.section}>Privacy</Text>
      <View style={styles.notifBox}>
        <View style={styles.notifRow}>
          <View style={styles.notifIcon}><Ionicons name="shield-checkmark-outline" size={20} color={colors.gold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>Share usage & device info</Text>
            <Text style={styles.notifSub}>Helps us improve the app. No location unless you enable it below.</Text>
          </View>
          <Switch value={shareOn} onValueChange={toggleShare} trackColor={{ false: '#3a2f52', true: colors.gold }} thumbColor={shareOn ? '#fff' : '#cdbfe6'} />
        </View>
        <View style={[styles.notifRow, { marginTop: spacing.md, opacity: shareOn ? 1 : 0.4 }]}>
          <View style={styles.notifIcon}><Ionicons name="location-outline" size={20} color={colors.gold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>Include my location</Text>
            <Text style={styles.notifSub}>Asks device permission. City & region only, for regional insights.</Text>
          </View>
          <Switch value={locOn} disabled={!shareOn} onValueChange={toggleLoc} trackColor={{ false: '#3a2f52', true: colors.gold }} thumbColor={locOn ? '#fff' : '#cdbfe6'} />
        </View>
      </View>

      <OutlineButton label={t('logout')} onPress={signOut} style={{ alignSelf: 'center', marginTop: spacing.xl, paddingHorizontal: 30 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontFamily: serif, fontSize: font.h1, fontWeight: '700', marginBottom: spacing.lg },

  // Auth
  authHead: { alignItems: 'center', marginBottom: spacing.xl },
  moon: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  authTitle: { color: colors.text, fontFamily: serif, fontSize: font.h2, fontWeight: '700', textAlign: 'center' },
  authSub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: '#fff', borderRadius: radius.pill, paddingVertical: 13 },
  googleText: { color: '#1f1f1f', fontSize: font.body, fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { color: colors.textMuted, fontSize: font.small },
  label: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cc: { backgroundColor: colors.bgCardSolid, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13 },
  ccText: { color: colors.text, fontWeight: '700', fontSize: font.body },
  phoneInput: { flex: 1, backgroundColor: colors.bgCardSolid, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: font.body },
  otpTitle: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700', textAlign: 'center' },
  otpSub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  otpInput: { backgroundColor: colors.bgCardSolid, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gold, color: colors.text, textAlign: 'center', fontSize: 28, letterSpacing: 12, paddingVertical: 12 },
  otpActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  linkText: { color: colors.gold, fontSize: font.small, fontWeight: '700' },
  err: { color: colors.ratingPink, fontSize: font.small, textAlign: 'center', marginTop: spacing.md },
  demoNote: { color: colors.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.lg, opacity: 0.8 },

  // Profile
  idCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  avatarWrap: { width: 56, height: 56 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.bgCardSolid },
  avatarText: { color: colors.gold, fontFamily: serif, fontSize: font.h2, fontWeight: '700' },
  camBadge: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bgCard },
  idName: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  provRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  provText: { color: colors.textMuted, fontSize: font.tiny },
  intro: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.md, lineHeight: 19 },
  saved: { color: colors.gold, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm },

  section: { color: colors.text, fontFamily: serif, fontSize: font.h3, fontWeight: '700', marginTop: spacing.xl, marginBottom: spacing.sm },
  notifBox: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notifIcon: { width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  notifSub: { color: colors.textMuted, fontSize: font.tiny, marginTop: 2, lineHeight: 16 },
});
