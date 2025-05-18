// _layout.tsx

import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEventStore } from "@/stores/eventStore";
import { useMode } from "@/hooks/useMode";

/**
 * EventLayout
 *
 * Defines the navigation stack for event-related screens: payment, details, and edit.
 * - Customizes header title and back button for the payment screen.
 * - Applies theming based on current mode.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function EventLayout(): JSX.Element {
  const router = useRouter();
  const mode = useMode();

  return (
    <Stack
      screenOptions={({ route }) => {
        let headerTitle = "Eventix";
        let headerLeft;

        // If we're on the payment route, adjust header
        if (route.name.includes("pay")) {
          headerTitle = "Payment";
          headerLeft = () => (
            <TouchableOpacity
              onPress={() => {
                useEventStore.getState().setEventToPay(null);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={mode.text} />
            </TouchableOpacity>
          );
        }

        return {
          /**
           * Screen title
           */
          title: headerTitle,
          /**
           * Center-align the header title
           */
          headerTitleAlign: "center",
          /**
           * Conditionally render a custom back button
           */
          ...(headerLeft && { headerLeft }),
          /**
           * Header background color based on theme
           */
          headerStyle: {
            backgroundColor: mode.headerFooter,
          },
          /**
           * Header text/icon color based on theme
           */
          headerTintColor: mode.text,
        };
      }}
    >
      {/* Payment screen */}
      <Stack.Screen name="pay" />
      {/* Event details screen */}
      <Stack.Screen name="index" />
      {/* Event edit screen */}
      <Stack.Screen name="edit" />
    </Stack>
  );
}
