import '../src/silenceWebWarnings';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AuthProvider } from '../src/context/AuthContext';
import { scheduleDailyReminders } from '../src/notifications';
import IntroSplash from '../src/components/IntroSplash';
import { logSession } from '../src/lib/analytics';
import { colors } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();
  const responseListener = useRef();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Re-arm daily reminders on launch if the user enabled them before.
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const on = await AsyncStorage.getItem('notif.enabled');
          if (on === '1') await scheduleDailyReminders();
        }
      } catch (e) { /* ignore */ }
    })();

    // Log this app-open (device/location/user) if the user consented.
    logSession();

    // Tapping a reminder opens the reading bot.
    responseListener.current = Notifications.addNotificationResponseReceivedListener((resp) => {
      const route = resp?.notification?.request?.content?.data?.route;
      if (route) router.push(route);
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bgDeep }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.text,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="pick-cards" options={{ title: 'Pick Your Cards' }} />
            <Stack.Screen name="reading-result" options={{ title: 'Your Reading' }} />
          </Stack>
          {showIntro ? <IntroSplash onDone={() => setShowIntro(false)} /> : null}
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
