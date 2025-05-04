import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Pressable, ActivityIndicator } from "react-native";
import Footer from "@/components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import EventCardRow from "@/components/EventCardRow";
import EventCardCalendar from "@/components/EventCardCalendar";
import { MyEventCardProps } from "@/types/models";
import { useEventStore } from "@/stores/eventStore";
import EventsModal from "@/components/EventsModal";

export default function MyEventsScreen() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [events, setEvents] = useState<MyEventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [weekStart, setWeekStart] = useState(calcWeekStart(new Date()));
  const [firstWeek, setFirstWeek] = useState(calcWeekStart(new Date()));
  const [lastWeek, setLastWeek] = useState(calcWeekStart(new Date()));

  const [showModal, setShowModal] = useState(false);
  const [modalEvents, setModalEvents] = useState<MyEventCardProps[]>([]);

  function calcWeekStart(date: Date) {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    copy.setDate(copy.getDate() + diff + 1);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function calcWeekEnd(start: Date) {
    const copy = new Date(start);
    copy.setDate(copy.getDate() + 6);
    return copy;
  }

  const loadEvents = async (start: Date, end: Date) => {
    if (end <= lastWeek) {
      return;
    }
    setIsLoading(true);
    const response = await useEventStore.getState().getMyEvents(start, end);
    if (response.success && response.data) {
      const newEvents = [...events, ...response.data];
      setEvents(newEvents);
      setLastWeek(end);
    }
    else {
      Alert.alert("Error", response.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const start = calcWeekStart(new Date());
    const end = calcWeekEnd(start);
    setWeekStart(start);
    loadEvents(start, end);
  }, []);

  const previousWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
    loadEvents(newStart, calcWeekEnd(newStart));
  };

  const nextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
    loadEvents(newStart, calcWeekEnd(newStart));
  };

  const today = new Date().toLocaleDateString('en-US');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="cloud-upload-outline" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>My events</Text>
        <TouchableOpacity
          onPress={() => {
            setView(view === "list" ? "calendar" : "list");
          }}
        >
          <Ionicons
            name={view === "list" ? "calendar-number-outline" : "list-outline"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.eventList}>
        {view === "list" ? (
          <>
            <Text style={styles.dateRange}>
              {new Date(firstWeek.getTime() - 1).toLocaleDateString("sk-SK", { dateStyle: "medium" })} - {(new Date(lastWeek.getTime() -1)).toLocaleDateString("sk-SK", { dateStyle: "medium" })}
            </Text>
            <FlatList
              data={events}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => <EventCardRow event={item} />}
            />
            {isLoading ? (
              <ActivityIndicator style={{ marginTop: 10 }} size="large" />
            ) : (
              <Pressable
                style={styles.loadMore}
                onPress={() => {
                  const nextStart = new Date(weekStart);
                  nextStart.setDate(nextStart.getDate() + 7);
                  setWeekStart(nextStart);
                  loadEvents(nextStart, calcWeekEnd(nextStart));
                }}
              >
                <Text style={styles.loadMoreText}>Load more</Text>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.month}>
                {weekStart.toLocaleDateString("en-US", { month: "long" })}
              </Text>
              <View style={styles.arrows}>
                <Pressable onPress={previousWeek} disabled={weekStart <= firstWeek}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={weekStart <= firstWeek ? "gray" : "black"}
                  />
                </Pressable>
                <Pressable onPress={nextWeek}>
                  <Ionicons name="arrow-forward" size={24} />
                </Pressable>
              </View>
            </View>

            <FlatList
              style={{ marginTop: 20 }}
              data={Array.from({ length: 7 }, (_, i) => {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + i -1 );
                return {
                  id: i.toString(),
                  fullDate: d.toLocaleDateString("en-US"),
                  date: d.getDate().toString(),
                  dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
                };
              })}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const dayEvents = events.filter(
                  e => new Date(e.date).toLocaleDateString("en-US") === item.fullDate
                );

                return (
                  <View style={styles.calendarItem}>
                    <View
                      style={[
                        styles.day,
                        today === item.fullDate
                          ? { backgroundColor: "#F7863B" }
                          : { backgroundColor: "#FBAE7A" },
                      ]}
                    >
                      <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <Text style={styles.dayName}>{item.dayName}</Text>

                    {dayEvents.length > 0 && (
                      <>
                        <View style={styles.cardView}>
                          <EventCardCalendar event={dayEvents[0]} />
                          {dayEvents.length > 1 && (
                            <Pressable
                              style={styles.moreButton}
                              onPress={() => {
                                setModalEvents(dayEvents);
                                setShowModal(true);
                              }}
                            >
                              <Text style={styles.moreText}>+{dayEvents.length - 1}</Text>
                            </Pressable>
                          )}
                        </View>
                        <EventsModal
                          events={modalEvents}
                          modalVisible={showModal}
                          setModalVisible={setShowModal}
                        />
                      </>
                    )}
                  </View>
                );
              }}
            />
          </>
        )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  eventList: {
    flex: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  loadMore: {
    padding: 8,
    backgroundColor: "#E4E4E4",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 6,
    width: "35%",
    marginVertical: 10,
    boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.25)",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateRange: {
    padding: 10,
    fontSize: 16,
  },
  day: {
    height: 70,
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarItem: {
    marginVertical: 7,
    flexDirection: "row",
  },
  arrows: {
    flexDirection: "row",
    gap: 10,
  },
  date: {
    fontSize: 20,
    fontWeight: "bold",
  },
  month: {
    fontSize: 20,
    fontWeight: "bold",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    marginTop: 5,
  },
  moreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "center",
    marginRight: 10,
  },
  moreText: {
    width: "100%",
    fontSize: 22,
    fontWeight: "600",
    color: "#D37408",
  },
  cardView: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
});