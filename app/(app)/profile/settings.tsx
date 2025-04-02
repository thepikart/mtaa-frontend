import { View, Text, Alert, FlatList, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Footer from "@/components/Footer";

export default function SettingsScreen() {

    const [darkMode, setDarkMode] = useState(false);

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

    const options = [
        {id: 1, title: "Edit profile", onPress: () => router.push("/profile/edit")},
        {id: 2, title: "Bank account", onPress: () => router.push("/profile/bank")},
        {id: 3, title: "Notifications", onPress: () => router.push("/profile/notifications")},
        {id: 4, title: "Dark mode", onPress:() => setDarkMode(!darkMode)},
        {id: 5, title: "Logout", onPress: handleLogout},
    ];

    return(
        <View style={styles.container}>
            <FlatList
                data={options}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity  onPress={item.onPress} disabled={item.id == 4}
                    style={[styles.option, item.id == 4 && styles.optionDarkMode, item.id == 5 && styles.optionLogout]}>
                        <Text style={[styles.optionText, item.id == 5 && styles.optionLogoutText ]}>{item.title}</Text>
                        {item.id == 4 && (
                            <Switch value={darkMode} onValueChange={setDarkMode}/>
                        )}
                        {item.id == 5 && (
                            <Ionicons name="log-out-outline" size={24} color={"firebrick"} />
                        )}
                    </TouchableOpacity>
                )}
            />
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
    },
    option: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    optionText: {
        fontSize: 15,
    },
    optionDarkMode: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    optionLogout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    optionLogoutText: {
        color: "firebrick",
    },
});