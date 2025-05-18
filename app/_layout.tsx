// _layout.tsx
// @module RootLayout
// Main layout of the React Native Expo application.

/**
 * Suppresses modular deprecation warnings for React Native Firebase.
 * @global
 */
declare global { var RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS: boolean; }
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { JSX, useEffect, useRef } from "react";
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';
import { useMode } from "@/hooks/useMode";
import { Platform, StatusBar, useColorScheme, View, Text } from 'react-native';
import { useSystemStore } from '@/stores/systemStore';
import { registerBackgroundTask } from '@/backgroundTasks/getMyEvents';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * RootLayout component
 * 
 * Responsibilities:
 * - Initializes user authentication from stored token.
 * - Syncs app theme (dark/light) with the operating system.
 * - Registers background tasks for event synchronization.
 * - Enables Crashlytics and Analytics, logs app open event.
 * - Displays an offline banner and configures toast messages.
 *
 * @returns {JSX.Element} The root layout including navigation and toast configuration.
 */
export default function RootLayout(): JSX.Element {
  const mode = useMode();
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const connected = useSystemStore((state) => state.connected);
  const ws = useRef<WebSocket>();

  /**
   * Initializes authentication by loading user data from a saved token.
   * Redirects to home if successful, or to login otherwise.
   * @async
   * @function initializeAuth
   * @returns {Promise<void>}
   */
  const initializeAuth = async (): Promise<void> => {
    const result = await useUserStore.getState().loadUserFromToken();
    if (result.success) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  };

  /**
   * Syncs the app's theme with the system color scheme.
   * Triggers user authentication initialization.
   * @listens useColorScheme()
   */
  useEffect(() => {
    const modeToSet = systemColorScheme === "dark" ? "dark" : "light";
    useSystemStore.getState().setMode(modeToSet);
    initializeAuth();
  }, [systemColorScheme]);

  /**
   * Configures Android StatusBar for translucency and style.
   * Responds to changes in app mode (dark/light).
   */
  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      const style = useSystemStore.getState().mode === "dark" ? "light-content" : "dark-content";
      StatusBar.setBarStyle(style);
    }
  }, [useSystemStore.getState().mode]);

  /**
   * Registers the background task that periodically fetches "my events".
   * Errors are logged to Crashlytics.
   */
  useEffect(() => {
    (async () => {
      try {
        await registerBackgroundTask();
      } catch (e) {
        crashlytics().recordError(e as Error);
      }
    })();
  }, []);

  /**
   * Enables Crashlytics and Analytics collections and logs the app open event.
   */
  useEffect(() => {
    (async () => {
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      await analytics().setAnalyticsCollectionEnabled(true);
      await analytics().logAppOpen();
    })();
  }, []);

  /**
   * Toast configuration for different message types.
   * Customizes background colors and border styles.
   */
  const toastConfig = {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ backgroundColor: "#D6F9D4", borderColor: "#7FE279" }}
      />
    ),
    error: (props: BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{ backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }}
      />
    ),
    info: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ backgroundColor: "#E0F2FE", borderColor: "#60A5FA" }}
      />
    ),
  } as const;

  const offlineBannerHeight = connected ? 0 : 40;
  const barColor = connected ? 'transparent' : '#F00000';
  const barStyle = useSystemStore.getState().mode === 'dark' ? 'light-content' : 'dark-content';

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor={barColor} barStyle={barStyle} />

      {!connected && (
        <View
          style={{
            position: 'absolute',
            top: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
            left: 0,
            right: 0,
            backgroundColor: '#F00000',
            height: offlineBannerHeight,
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            You are offline
          </Text>
        </View>
      )}

      <View style={{ flex: 1, marginTop: offlineBannerHeight }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: mode.background },
          }}
        />
        <Toast config={toastConfig} />
      </View>
    </View>
  );
}
