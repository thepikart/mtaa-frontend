import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "expo-router";
import Footer from "@/components/Footer";
import EventCardColumn from "@/components/EventCardColumn";
import Ionicons from "@expo/vector-icons/Ionicons";
import calculateColor from "@/utils/pfp";

export default function ProfileScreen() {

    const router = useRouter();
    const user = useUserStore.getState().user;

    const loadImage = () => {
        if (user?.photo && user.photo.includes(`photos/user_${user.id}`)) {
            return process.env.EXPO_PUBLIC_BASE_URL + "/" + user.photo;
        }
        else {
            return user?.photo || undefined;
        }
    }

    const calculateFooterColor = () => {
        const user = useUserStore.getState().user;
        if (!user) {
            return "#BCBCBC";
        }
        else {
            return calculateColor(user.name, user.surname);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.username}>{user?.username}</Text>
                <TouchableOpacity onPress={() => router.push("/profile/settings")}>
                    <Ionicons name="settings-sharp" size={24} />
                </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
                {loadImage() ? (
                    <Image style={styles.pfpImage} src={loadImage()} />
                ) : (
                    <Text style={[styles.pfpInitials, { backgroundColor: calculateFooterColor() }]}>{useUserStore.getState().user?.name?.[0].toUpperCase()}{useUserStore.getState().user?.surname?.[0].toUpperCase()}</Text>
                )}
                <View style={styles.userInfoText}>
                    <Text style={styles.name}>{user?.name} {user?.surname}</Text>
                    <Text style={styles.bio}>{user?.bio}</Text>
                </View>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.button}>
                    <Text>Created events</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text>Going to</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.list}>
                <EventCardColumn />
                <EventCardColumn />
            </View>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
    },
    list: {
        flex: 1,
        flexDirection: "row",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: "100%",
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
    },
    pfpInitials: {
        width: 96,
        height: 96,
        borderRadius: 100,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 32,
    },
    pfpImage: {
        width: 96,
        height: 96,
        borderRadius: 100,
    },
    userInfo: {
        flexDirection: "row",
        width: "100%",
        padding: 15,
    },
    userInfoText: {
        marginLeft: 10,
        flex: 1,
    },
    bio: {
        paddingTop: 5,
    },
    name: {
        fontWeight: "500",
    },
    buttons: {
        flexDirection: "row",
    },
    button: {
        width: "50%",
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderWidth: 1,
        borderColor: "#D9D9D9",
    }
});