import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import { useMode } from "@/hooks/useMode";
export default function AppLayout() {
  const mode = useMode();
  const router = useRouter();
  const user = useUserStore.getState().user;

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user]);

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
