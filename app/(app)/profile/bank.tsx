import { View, Text, StyleSheet } from "react-native";
import Footer from "@/components/Footer";

export default function BankAccountScreen() {
    return (
        <View style={styles.container}>
            <Text>bank account</Text>
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