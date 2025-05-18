// home.tsx

import { View, Text, StyleSheet, ScrollView } from "react-native";
import Footer from "@/components/Footer";
import { useMode } from "@/hooks/useMode";
import { useEffect, useState } from "react";
import EventService from "@/services/EventService";
import EventCardMini from "@/components/EventCardMini";
import { useSystemStore } from "@/stores/systemStore";
import { useUserLocation } from "@/hooks/useUserLocation";

/**
 * HomeScreen component
 * 
 * Fetches and displays three sections of events:
 * - Recommended Events
 * - Events Near the User (uses geolocation)
 * - Upcoming Events
 * 
 * @component
 * @returns {JSX.Element}
 */
export default function HomeScreen(): JSX.Element {
  // Theme colors from custom hook
  const mode = useMode();
  // Network connectivity state
  const connected = useSystemStore((state) => state.connected);

  // Event lists state
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [nearEvents, setNearEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  // User geolocation hook
  const {
    coords,
    loading: locLoad,
    error: locError,
  } = useUserLocation();

  /**
   * Effect to fetch recommended and upcoming events when connected.
   * @async
   */
  useEffect(() => {
    if (!connected) {
      return;
    }
    const fetchEvents = async (): Promise<void> => {
      try {
        const [recommended, upcoming] = await Promise.all([
          EventService.getRecommendedEvents(),
          EventService.getUpcomingEvents(),
        ]);
        setRecommendedEvents(recommended || []);
        setUpcomingEvents(upcoming || []);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    };
    fetchEvents();
  }, [connected]);

  /**
   * Effect to fetch events near the user when coords are available.
   * @async
   */
  useEffect(() => {
    if (!connected || locLoad || !coords) return;

    (async (): Promise<void> => {
      try {
        const near = await EventService.getEventsNear(coords, 25);
        setNearEvents(near || []);
      } catch (e) {
        console.error('Error loading near events', e);
      }
    })();
  }, [connected, locLoad, coords]);

  /**
   * Renders a section of events with a title and horizontal scroll.
   * @param {string} title - Section header text.
   * @param {any[]} events - Array of event objects.
   * @returns {JSX.Element}
   */
  const renderSection = (title: string, events: any[]): JSX.Element => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: mode.text }]}>{title}</Text>
      {events.length === 0 ? (
        <Text style={{ color: mode.text }}>No events found.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {events.map((event) => (
            <EventCardMini key={event.id} event={event} />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: mode.background }]}>      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderSection("Recommended Events", recommendedEvents)}
        {renderSection("Events Near You", nearEvents)}
        {renderSection("Upcoming Events", upcomingEvents)}
      </ScrollView>
      <Footer />
    </View>
  );
}

/**
 * Styles for HomeScreen component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 6,
  },
});
