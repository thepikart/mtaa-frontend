import { View, Text, Alert, FlatList, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import Footer from "@/components/Footer";
import { useSystemStore } from "@/stores/systemStore";
import { useMode } from "@/hooks/useMode";
/**
 * SettingsScreen
 *
 * Screen for app settings:
 * - Navigation to edit profile, bank account, and notifications
 * - Toggle for dark mode
 * - Logout action
 *
 * @component
 * @returns {JSX.Element}
 */
export default function SettingsScreen(): JSX.Element  {

    const mode = useMode();
    const darkMode = useSystemStore((state) => state.mode);
    const setDarkMode = useSystemStore((state) => state.setMode);

    const router = useRouter();

        /**
         * handleLogout
         *
         * Logs the user out via the user store,
         * then navigates to the login screen on success,
         * or shows an alert on failure.
         *
         * @async
         * @function handleLogout
         * @returns {Promise<void>}
         */
        const handleLogout = async (): Promise<void> => {
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
        {id: 4, title: "Dark mode", },
        {id: 5, title: "Logout", onPress: handleLogout},
    ];

    return(
        <View style={[styles.container, {backgroundColor: mode.background}]}>
            <FlatList
                data={options}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={item.onPress} disabled={item.id == 4}
                    style={[styles.option, {borderBottomColor: mode.border} , item.id == 4 && styles.optionDarkMode, item.id == 5 && styles.optionLogout]}>
                        <Text style={[styles.optionText, {color:mode.text} , item.id == 5 && styles.optionLogoutText]}>{item.title}</Text>
                        {item.id == 4 && (
                            <Switch
                                value={darkMode === "dark"}
                                onValueChange={() => setDarkMode(darkMode === "dark" ? "light" : "dark")}
                            />
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