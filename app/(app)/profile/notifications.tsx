import { View, Text, StyleSheet } from "react-native";
import Footer from "@/components/Footer";

export default function NotificationsScreen() {
    return (
        <View style={styles.container}>
            <Text>notifications</Text>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
    }
});