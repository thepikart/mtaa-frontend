import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Footer from "@/components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import EventCardRow from "@/components/EventCardRow";
import EventCardCalendar from "@/components/EventCardCalendar";
import { MyEventCardProps } from "@/types/models";
import { useEventStore } from "@/stores/eventStore";
import EventsModal from "@/components/EventsModal";
import { useMode } from "@/hooks/useMode";
import { useSystemStore } from "@/stores/systemStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import { useRef } from 'react';


/**
 * MyEventsScreen
 *
 * Displays the user’s personal events in list or calendar view,
 * fetches from API when online, and falls back to AsyncStorage when offline.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function MyEventsScreen(): JSX.Element {
  const connected = useSystemStore((state) => state.connected);
  const mode = useMode();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [events, setEvents] = useState<MyEventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [weekStart, setWeekStart] = useState(calcWeekStart(new Date()));
  const [firstWeek, setFirstWeek] = useState(calcWeekStart(new Date()));
  const [lastWeek, setLastWeek] = useState(calcWeekStart(new Date()));

  const [showModal, setShowModal] = useState(false);
  const [modalEvents, setModalEvents] = useState<MyEventCardProps[]>([]);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
    /**
     * calcWeekStart
     *
     * Computes the start-of-week (00:00:00.001) for a given date.
     *
     * @param date — any date within the desired week
     * @returns the Date object set to that week’s start
     */
    function calcWeekStart(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 1);
    return copy;
  }
/**
 * calcWeekEnd
 *
 * Given a week-start date, returns the date 7 days later.
 *
 * @param start — start of the week
 * @returns the Date exactly one week after `start`
 */
function calcWeekEnd(start: Date): Date {
    const copy = new Date(start);
    copy.setDate(copy.getDate() + 7);
    return copy;
  }
/**
 * loadEvents
 *
 * Loads events between `start` and `end` from the backend when online,
 * appends new weeks to state, and de-duplicates by event id.
 *
 * @param start — week start date
 * @param end   — week end date
 * @async
 * @returns Promise<void>
 */
const loadEvents = async (start: Date, end: Date): Promise<void> => {
    if (!connected) {
      return;
    }
    if (end <= lastWeek) return;

    setIsLoading(true);
    const response = await useEventStore.getState().getMyEvents(start, end);
    if (response.success && response.data) {
      const merged = [...events, ...response.data];
      // dedupe by id
      const unique = merged.filter(
        (e, i, all) => all.findIndex(x => x.id === e.id) === i
      );
      setEvents(unique);
      setLastWeek(end);
    } else {
      Alert.alert("Error", response.message);
    }
    setIsLoading(false);
  };
/**
 * saveEvents
 *
 * Fetches all future events (up to 30 days) when online, strips photos,
 * and persists them to AsyncStorage for offline use.
 *
 * @async
 * @returns Promise<void>
 */
const saveEvents = async (): Promise<void> => {
    try {
      if (connected) {
        const response = await useEventStore
          .getState()
          .getMyEvents(firstWeek, maxDate);
        if (response.success && response.data) {
          // strip photos for storage
          const stored = response.data.map(e => ({ ...e, photo: null }));
          await AsyncStorage.setItem("myEvents", JSON.stringify(stored));
        }
      }
    } catch {}
  };

  useEffect(() => {
    saveEvents();
    const start = calcWeekStart(new Date());
    const end = calcWeekEnd(start);
    setWeekStart(start);
    loadEvents(start, end);
  }, []);

  useEffect(() => {
    if (!connected) {
      setEvents([]);
      (async () => {
        const stored = await AsyncStorage.getItem("myEvents");
        if (stored) {
          setEvents(JSON.parse(stored));
          setLastWeek(maxDate);
          setWeekStart(calcWeekStart(new Date()));
        }
      })();
    }
  }, [connected]);
/**
 * previousWeek
 *
 * Navigates one week backwards if past the first loaded week.
 *
 * @returns void
 */
const previousWeek = (): void => {
    if (weekStart <= firstWeek) {
      return;
    }
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
    loadEvents(newStart, calcWeekEnd(newStart));
  };
/**
 * nextWeek
 *
 * Navigates one week forwards, respecting the offline max-date limit.
 *
 * @returns void
 */
const nextWeek = (): void =>  {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    if (!connected && newStart > maxDate) {
      Alert.alert(
        "Offline mode",
        "You can only view events for the next 30 days in offline mode."
      );
      return;
    }
    setWeekStart(newStart);
    loadEvents(newStart, calcWeekEnd(newStart));
  };

  const today = new Date().toLocaleDateString("en-US");
  const calcDateRange = () => {
    const s = new Date(firstWeek.getTime() - 2).toLocaleDateString("sk-SK", {
      dateStyle: "medium",
    });
    const e = new Date(lastWeek.getTime() - 2).toLocaleDateString("sk-SK", {
      dateStyle: "medium",
    });
    return `${s} - ${e}`;
  };

  const canNext = useRef(true);
  const canPrev = useRef(true);
  const TRIGGER = 0.5;
  const RELEASE = 0.2;

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const sub = Accelerometer.addListener(({ x }) => {

      if (x > TRIGGER && canPrev.current) {
        previousWeek();
        canPrev.current = false;
      }
      else if (x < -TRIGGER && canNext.current) {
        nextWeek();
        canNext.current = false;
      }
      else if (Math.abs(x) < RELEASE) {
        canNext.current = true;
        canPrev.current = true;
      }
    });

    return () => sub.remove();
  }, [weekStart]);

  return (
    <View style={[styles.container, { backgroundColor: mode.background }]}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="cloud-upload-outline" size={24} color={mode.text} />
        </TouchableOpacity>
        <Text style={[styles.title, {color: mode.text}]}>My events</Text>
        <TouchableOpacity
          onPress={() => {
            setView(view === "list" ? "calendar" : "list");
          }}
        >
          <Ionicons
            name={view === "list" ? "calendar-number-outline" : "list-outline"}
            size={24}
            color={mode.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.eventList}>
        {view === "list" ? (
          <>
            <Text style={[styles.dateRange, { color: mode.text }]}>
              {calcDateRange()}
            </Text>
            <FlatList
              data={events}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <EventCardRow event={item} />}
            />
            {isLoading ? (
              <ActivityIndicator style={{ marginTop: 10 }} size="large" />
            ) : (
              <Pressable style={styles.loadMore} onPress={nextWeek}>
                <Text style={styles.loadMoreText}>Load more</Text>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[styles.month, {color: mode.text}]}>
                {weekStart.toLocaleDateString("en-US", { month: "long" })}
              </Text>
              <View style={styles.arrows}>
                <Pressable onPress={previousWeek} disabled={weekStart <= firstWeek}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={weekStart <= firstWeek ? mode.disabledButton : mode.text}
                  />
                </Pressable>
                <Pressable onPress={nextWeek}>
                  <Ionicons name="arrow-forward" size={24} color={mode.text}/>
                </Pressable>
              </View>
            </View>

            <FlatList
              style={{ marginTop: 20 }}
              data={Array.from({ length: 7 }, (_, i) => {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + i);
                return {
                  id: i.toString(),
                  fullDate: d.toLocaleDateString("en-US"),
                  date: d.getDate().toString(),
                  dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
                };
              })}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const dayEvents = events.filter(
                  (e) =>
                    new Date(e.date).toLocaleDateString("en-US") === item.fullDate
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
                    <Text style={[styles.dayName,{color:mode.text}]}>{item.dayName}</Text>

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