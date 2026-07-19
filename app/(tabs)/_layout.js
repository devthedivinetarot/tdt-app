import React from 'react';
import { View } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassTabBar from '../../src/components/GlassTabBar';
import LangButton from '../../src/components/LangButton';

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Hide the floating language toggle on the Reading (full-screen bot) page.
  const showLang = pathname !== '/reading';

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
        tabBar={(props) => <GlassTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: t('menu_home') }} />
        <Tabs.Screen name="reading" options={{ title: t('menu_reading') }} />
        <Tabs.Screen name="courses" options={{ title: t('menu_courses') }} />
        <Tabs.Screen name="kundli" options={{ title: t('menu_kundli') }} />
        <Tabs.Screen name="profile" options={{ title: t('menu_profile') }} />
      </Tabs>

      {showLang ? (
        <LangButton style={{ position: 'absolute', top: insets.top + 10, right: 16, zIndex: 50 }} />
      ) : null}
    </View>
  );
}
