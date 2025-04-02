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
        <Stack screenOptions={{
            title: "Eventix",
            headerTitleAlign: "center",
            headerRight: () => {
                return (
                    <TouchableOpacity onPress={() => router.push("/create-event")}>
                        <Ionicons name="add-circle" size={34} color="#BCBCBC" />
                    </TouchableOpacity>
                );
            }
        }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="create-event" />
            <Stack.Screen name="profile/[profileId]" />
            <Stack.Screen name="search" />
            <Stack.Screen name="my-events" />
        </Stack>
    );
}