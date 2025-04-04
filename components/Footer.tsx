import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import calculateColor from "@/utils/pfp";

export default function Footer() {
    const user = useUserStore((state) => state.user);

    const loadImage = () => {
        if (user?.photo && user.photo.includes(`photos/user_${user.id}`)) {
            return process.env.EXPO_PUBLIC_BASE_URL + "/" + user.photo;
        }
        else {
            return user?.photo || undefined;
        }
    }

    const calculateFooterColor = () => {
        if (!user) {
            return "#BCBCBC";
        }
        else {
            return calculateColor(user.name, user.surname);
        }
    }

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
            <TouchableOpacity onPress={() => router.push(`/profile/${user?.id}`)}>
                {loadImage() ? (
                    <Image style={styles.pfpImage} src={loadImage()} />
                ) : (
                    <Text style={[styles.pfpInitials, { backgroundColor: calculateFooterColor() }]}>{user?.name?.[0].toUpperCase()}{user?.surname?.[0].toUpperCase()}</Text>
                )}
            </TouchableOpacity>
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
    pfpInitials: {
        width: 32,
        height: 32,
        borderRadius: 20,
        textAlign: "center",
        textAlignVertical: "center",
    },
    pfpImage: {
        width: 32,
        height: 32,
        borderRadius: 20,
    },
})