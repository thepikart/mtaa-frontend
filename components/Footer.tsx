import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import ProfilePhoto from "./ProfilePhoto";

export default function Footer() {
    const user = useUserStore((state) => state.user);
    const router = useRouter();

    return (
        <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/home")}>
                <Ionicons name="home-outline" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/search")}>
                <Ionicons name="search-outline" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/my-events")}>
                <Ionicons name="calendar-outline" size={28} color="black" />
            </TouchableOpacity>
            {user && (
                <ProfilePhoto size={32} borderRadius={100} fontSize={14} id={user.id} name={user.name} surname={user.surname} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: "fixed",
        zIndex: 1,
        width: "100%",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#ffffff",
        boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
    },
})