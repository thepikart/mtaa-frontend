import {View, Text, StyleSheet } from "react-native";
import { useUserStore } from "@/stores/userStore";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Home Screen</Text>
            <Text> Username: {useUserStore.getState().user?.username}</Text>
            <Text> Email: {useUserStore.getState().user?.email}</Text>
            <Text> Bio: {useUserStore.getState().user?.bio}</Text>
            <Text> Photo: {useUserStore.getState().user?.photo}</Text>
            <Text> ID: {useUserStore.getState().user?.id}</Text>
            <Text> Name: {useUserStore.getState().user?.name}</Text>
            <Text> Surname: {useUserStore.getState().user?.surname}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 34,
        fontWeight: "500",
        marginBottom: "20%",
    },
});