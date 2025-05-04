import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AppLayout() {

    const router = useRouter();

    const user = useUserStore.getState().user;
    if (!user) {
        router.replace("/login");
    }

    return (
        <Stack screenOptions={({ route }) => {
            let headerTitle = "Eventix";
            let headerRight = () => (
                <TouchableOpacity onPress={() => router.push("/create-event")}>
                    <Ionicons name="add-circle" size={34} color="#BCBCBC" />
                </TouchableOpacity>
            );
            if (route.name.includes("profile") && route.name !== "profile/[profileId]") {
                headerTitle = "Settings";
                headerRight = () => <></>;
            }

            return {
                title: headerTitle,
                headerTitleAlign: "center",
                headerRight,
            };
        }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="create-event" />
            <Stack.Screen name="profile/[profileId]" />
            <Stack.Screen name="search" />
            <Stack.Screen name="my-events" />
            <Stack.Screen name="event/[eventId]" options={{ headerShown: false }}/>
        </Stack>
    );
}