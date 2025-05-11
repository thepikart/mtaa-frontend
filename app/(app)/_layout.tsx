import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import { useMode } from "@/hooks/useMode";
import Toast from "react-native-toast-message";
import messaging from '@react-native-firebase/messaging';
import { useSystemStore } from "@/stores/systemStore";

export default function AppLayout() {
  const mode = useMode();
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const register = async () => {
    await useUserStore.getState().registerForNotifications();
  }

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    else {
      register();
      const loadQueue = async () => {
        await useSystemStore.getState().setOfflineQueue();
        await useSystemStore.getState().syncOfflineQueue();
      }
      loadQueue();
    }

  }, [user]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const { title, body } = remoteMessage.notification || {};
      const data = remoteMessage.data || {};
      if (title && body && data) {
        Toast.show({
          type: typeof data.type === 'string' ? data.type : 'info',
          text1: title,
          text2: body,
          position: 'top',
          visibilityTime: 6500,
          autoHide: true,
          onPress: () => {
            if (data.id && data.id !== "0") {
              router.push(`/event/${data.id}`)
            }
          }
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Stack
      screenOptions={({ route }) => ({
        title:
          route.name === "profile/[profileId]"
            ? user
              ? `${user.name} ${user.surname}`
              : "Profile"
            : route.name.includes("profile")
              ? "Settings"
              : "Eventix",
        headerTitleAlign: "center",
        headerRight: () => null,
        headerStyle: { backgroundColor: mode.headerFooter },
        headerTintColor: mode.text,
      })}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="create-event" />
      <Stack.Screen name="profile/[profileId]" />
      <Stack.Screen name="search" />
      <Stack.Screen name="my-events" />
      <Stack.Screen
        name="event/[eventId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
