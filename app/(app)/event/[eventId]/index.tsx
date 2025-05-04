import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useEventStore } from "@/stores/eventStore";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { Event } from "@/types/models";
import Footer from '@/components/Footer';

export default function EventScreen() {
    const router = useRouter();
    const [event, setEvent] = useState<Event>({} as Event);
    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    useEffect(() => {
        const loadEvent = async () => {
            const response = await useEventStore.getState().getEventById(Number(eventId));
            if (response.success && response.data) {
                setEvent(response.data);
            }
            else {
                Alert.alert("Error", response.message);
            }
        };
        loadEvent();
    }, [eventId]);

    const handleRegister = async () => {
        if (event.price > 0) {
            useEventStore.getState().setEventToPay(event);
            router.push(`/event/${event.id}/pay`);
        }
        else {
            const response = await useEventStore.getState().registerForEvent(event.id);
            if (response.success) {
                Alert.alert("Success", "You have successfully registered for the event.");
            }
            else {
                Alert.alert("Error", response.message);
            }
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <Text>Event ID: {eventId}</Text>
                <Button onPress={handleRegister} title="Register" />
                <Text>{event.name}</Text>
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
