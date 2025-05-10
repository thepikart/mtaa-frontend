import { View, Text, StyleSheet, ScrollView } from "react-native";
import Footer from "@/components/Footer";
import { useMode } from "@/hooks/useMode";
import { useEffect, useState } from "react";
import EventService from "@/services/EventService";
import EventCardMini from "@/components/EventCardMini";
import { useSystemStore } from "@/stores/systemStore";
import { useUserLocation } from "@/hooks/useUserLocation";


export default function HomeScreen() {
  const mode = useMode();
  const connected = useSystemStore((state) => state.connected);

  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [nearEvents, setNearEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

   const {
   coords,
   loading: locLoad,
   error: locError,
 } = useUserLocation();

  useEffect(() => {
    if (!connected) {
      return;
    }
    const fetchEvents = async () => {
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
  }, [ connected ]);

  useEffect(() => {
    if (!connected || locLoad || !coords) return;

    (async () => {
      try {
        const near = await EventService.getEventsNear(coords, 25);
        setNearEvents(near || []);
      } catch (e) {
        console.error('Error loading near events', e);
      }
    })();
  }, [connected, locLoad, coords]);

  const renderSection = (title: string, events: any[]) => (
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
