import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { JSX, useEffect } from "react";
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';
import { useMode } from "@/hooks/useMode";
import { Platform, StatusBar, useColorScheme, View, Text } from 'react-native';
import { useSystemStore } from '@/stores/systemStore';
import { registerBackgroundTask } from '@/backgroundTasks/getMyEvents';

export default function RootLayout() {
  const mode = useMode();
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const connected = useSystemStore((state) => state.connected);

  const initializeAuth = async () => {
    const result = await useUserStore.getState().loadUserFromToken();
    if (result.success) {
      router.replace("/home");
    }
    else {
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (systemColorScheme === "dark") {
      useSystemStore.getState().setMode("dark");
    } else {
      useSystemStore.getState().setMode("light");
    }
    initializeAuth();
  }, [systemColorScheme]);

  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setBarStyle(useSystemStore.getState().mode === "dark" ? "light-content" : "dark-content");
    }
  }, [useSystemStore.getState().mode]);

  useEffect(() => {
    const backgroundTasks = async () => {
      await registerBackgroundTask();
    };
    backgroundTasks();
  }, []);

  const toastConfig = {
    success: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ backgroundColor: "#D6F9D4", borderWidth: 1, borderLeftWidth: 1, borderColor: "#7FE279", marginTop:10 }}
        text1Style={{
          fontSize: 15,
          fontWeight: '400',
        }}
      />
    ),
    error: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{ backgroundColor: "#FEE2E2", borderWidth: 1, borderLeftWidth: 1, borderColor: "#FCA5A5", marginTop:10 }}
        text1Style={{
          fontSize: 15,
          fontWeight: '400'
        }}
      />
    )
  };

  const offlineHeight = connected ? 0 : 40;
  const statusBarColor = connected ? 'transparent' : '#F00000';
  const statusBarStyle = useSystemStore.getState().mode === 'dark' ? 'light-content' : 'dark-content';

  return (
    <View style={{ flex: 1 }}>

      <StatusBar
        translucent
        backgroundColor={statusBarColor}
        barStyle={connected ? statusBarStyle : 'light-content'}
      />
      
      {!connected && (
        <View style={{
          position: 'absolute',
          top: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
          left: 0,
          right: 0,
          zIndex: 2,
          backgroundColor: '#F00000',
          height: 40,
          justifyContent: 'center',
        }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>You are offline</Text>
        </View>
      )}

      <View style={{ flex: 1, marginTop: offlineHeight }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: mode.background } }} />
        <Toast config={toastConfig} />
      </View>
    </View>
  );
}