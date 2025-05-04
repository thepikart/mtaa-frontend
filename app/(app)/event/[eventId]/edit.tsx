import { View, Text, StyleSheet } from 'react-native';
import { useEventStore } from "@/stores/eventStore";
import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import Footer from '@/components/Footer';

export default function EventScreen() {

    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    return (
        <View style={styles.container}>
            <View style={styles.container}>
            <Text>Event ID: {eventId} EDIT</Text>
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
});