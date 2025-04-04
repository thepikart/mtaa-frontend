import { View, Text, StyleSheet } from "react-native";
import Footer from "@/components/Footer";

export default function HomeScreen() {

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <Text>Homescreen</Text>
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