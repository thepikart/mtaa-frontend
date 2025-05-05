import { View, Text, StyleSheet } from "react-native";
import Footer from "@/components/Footer";
import { useMode } from "@/hooks/useMode";

export default function CreateEventScreen() {
    const mode = useMode();
    return (
        <View style={[styles.container, { backgroundColor: mode.background }]}>
            <View style={styles.container}>
                <Text style={[{color: mode.text}]}>create event</Text>
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