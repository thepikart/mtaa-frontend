import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

export default function AppLayout() {

    const router = useRouter();

    const checkAuth = async () => {
        const user = useUserStore.getState().user;
        if (!user) {
            router.replace("/login");
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    
    return (
        <Stack>
            <Stack.Screen name="home"/>
        </Stack>
    );
}