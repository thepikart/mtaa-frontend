import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}