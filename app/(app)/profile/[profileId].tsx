import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "expo-router";
import Footer from "@/components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileScreen() {

    const router = useRouter();
    const handleLogout = async () => {
        const result = await useUserStore.getState().logout();
        if (result.success) {
            router.replace("/login");
        }
        else {
            Alert.alert("Logout Error", result.message);
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out" size={24} color="black" />
            </TouchableOpacity>
            <Text> ID: {useUserStore.getState().user?.id}</Text>
            <Text> Name: {useUserStore.getState().user?.name}</Text>
            <Text> Surname: {useUserStore.getState().user?.surname}</Text>
            <Text> Username: {useUserStore.getState().user?.username}</Text>
            <Text> Email: {useUserStore.getState().user?.email}</Text>
            <Text> Bio: {useUserStore.getState().user?.bio}</Text>
            <Text> Photo: {useUserStore.getState().user?.photo}</Text>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
    }
});