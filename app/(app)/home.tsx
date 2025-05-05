import { View, Text, StyleSheet } from "react-native";
import Footer from "@/components/Footer";
import { useMode } from "@/hooks/useMode";

export default function HomeScreen() {

    const mode = useMode();

    return (
        <View style={[styles.container, { backgroundColor: mode.background }]}>
            <View style={styles.container}>
                <Text style={[{ color: mode.text }]}>Homescreen</Text>
            </View>
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