import { View, Text } from 'react-native';
import { useEventStore } from "@/stores/eventStore";
import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";

export default function EventScreen() {

    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    return (
       <Text>Event ID: {eventId} EDIT</Text>
    );
}