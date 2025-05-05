import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEventStore } from "@/stores/eventStore";
import { useMode } from "@/hooks/useMode";

export default function EventLayout() {
    const router = useRouter();
    const mode = useMode();

    return (
        <Stack screenOptions={({ route }) => {
            let headerTitle = "Eventix";
            let headerRight = () => (
                <TouchableOpacity onPress={() => router.push("/create-event")}>
                    <Ionicons name="add-circle" size={34} color="#BCBCBC" />
                </TouchableOpacity>
            );

            let headerLeft;
            if (route.name.includes("pay")) {
                headerTitle = "Payment";
                headerRight = () => <></>;

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
                title: headerTitle,
                headerTitleAlign: "center",
                headerRight,
                ...(headerLeft && { headerLeft }),
                headerStyle: {
                    backgroundColor: mode.headerFooter,
                },
                headerTintColor: mode.text,
            };
        }}>
            <Stack.Screen name="pay" />
            <Stack.Screen name="index" />
            <Stack.Screen name="edit" />
        </Stack>
    );
}
