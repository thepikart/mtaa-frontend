import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { JSX, useEffect } from "react";
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';

export default function RootLayout() {

  const router = useRouter();

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
    initializeAuth();
  }, []);

  const toastConfig = {
    success: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ backgroundColor: "#D6F9D4", borderWidth: 1, borderLeftWidth:1, borderColor: "#7FE279" }}
        text1Style={{
          fontSize: 15,
          fontWeight: '400',
        }}
      />
    ),
    error: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: 'red' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: '400'
        }}
        text2Style={{
          fontSize: 14
        }}
      />
    )
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig}/>
    </>
  );
}