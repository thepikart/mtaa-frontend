import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import { useMode } from "@/hooks/useMode";
import Toast from "react-native-toast-message";
import messaging from "@react-native-firebase/messaging";
import { useSystemStore } from "@/stores/systemStore";

/**
 * Root layout component that defines the navigation {@link Stack} for the
 * application.
 *
 * ## Responsibilities
 *
 * 1. **Authentication gate** – if the user is not logged in, immediately
 *    redirects to the `/login` screen.
 * 2. **Push notifications** – once the user is present, requests a push‑token
 *    and registers it with the backend via {@link useUserStore}.
 * 3. **Offline queue sync** – after mount, loads any locally stored requests
 *    and attempts to synchronise them with the server.
 * 4. **In‑app message handling** – listens for foreground Firebase Cloud
 *    Messaging (FCM) notifications and shows them in a toast; when the toast is
 *    tapped it deep‑links to the related event.
 *
 * @remarks
 * This component is meant to be mounted at the very top of the tree (similar to
 * an `App` component created by `expo prebuild`). Because it mounts only once,
 * it is safe to place long‑lived listeners (e.g., FCM subscription) here.
 *
 * @returns A React element configuring the navigation stack for the Expo Router.
 */
export default function AppLayout() {
  const mode = useMode();
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  /**
   * Registers the current user for push notifications.
   *
   * Internally calls `registerForNotifications` from {@link useUserStore}. The
   * call is awaited so that possible errors propagate to Sentry / error
   * boundary before navigation continues.
   *
   * @returns A `Promise` that resolves once the token is successfully registered.
   */
  const register = async (): Promise<void> => {
    await useUserStore.getState().registerForNotifications();
  };

  // ──────────────────────────────────────────────
  // Redirect unauthenticated users and bootstrap
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    // User exists → finish bootstrap in the background.
    register();

    const loadQueue = async (): Promise<void> => {
      await useSystemStore.getState().setOfflineQueue();
      await useSystemStore.getState().syncOfflineQueue();
    };

    loadQueue();
  }, [user]);

  // ──────────────────────────────────────────────
  // Foreground push‑notification listener
  // ──────────────────────────────────────────────
  useEffect(() => {
    /**
     * Displays incoming FCM notification in a toast and deep‑links to an event
     * when the user taps on it.
     *
     * @param remoteMessage - The message received from Firebase Cloud Messaging.
     */
    const unsubscribe = messaging().onMessage(
      async (remoteMessage): Promise<void> => {
        const { title, body } = remoteMessage.notification || {};
        const data = remoteMessage.data || {};

        if (title && body && data) {
          Toast.show({
            type: typeof data.type === "string" ? data.type : "info",
            text1: title,
            text2: body,
            position: "top",
            visibilityTime: 6500,
            autoHide: true,
            onPress: () => {
              if (data.id && data.id !== "0") {
                router.push(`/event/${data.id}`);
              }
            },
          });
        }
      },
    );

    // Clean up listener on unmount.
    return unsubscribe;
  }, []);

  // ──────────────────────────────────────────────
  // Navigation stack
  // ──────────────────────────────────────────────
  return (
    <Stack
      screenOptions={({ route }) => ({
        /**
         * Dynamically resolves the header title for each route. When the route
         * matches the logged‑in user's profile it shows the full name, otherwise
         * it displays either "Settings" for any other profile screen or the
         * default "Eventix" branding.
         */
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
      <Stack.Screen name="event/[eventId]" options={{ headerShown: false }} />
    </Stack>
  );
}
