import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Pressable, ActivityIndicator } from "react-native";
import Footer from "@/components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import EventCardRow from "@/components/EventCardRow";
import { MyEventCardProps } from "@/types/models";
import { useEventStore } from "@/stores/eventStore";

export default function MyEventsScreen() {

    const [view, setView] = useState<"list" | "calendar">("list");
    const [events, setEvents] = useState<MyEventCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastDate, setLastDate] = useState(new Date());

    useEffect(() => {
        const getMyEvents = async () => {
            setIsLoading(true);
            var startDate = new Date();
            var endDate = new Date();
            endDate.setDate(startDate.getDate() + 7);
            setLastDate(endDate);
            const response = await useEventStore.getState().getMyEvents(startDate, endDate);
            if (response.success && response.data) {
                console.log(startDate, endDate);
                setEvents(response.data);
            } else {
                Alert.alert("Error", response.message);
            }
            setIsLoading(false);
        }
        getMyEvents();
    }, []);

    const loadMoreEvents = async () => {
        setIsLoading(true);
        var startDate = lastDate;
        var endDate = new Date(lastDate);
        endDate.setDate(startDate.getDate() + 7);
        const response = await useEventStore.getState().getMyEvents(startDate, endDate);
        if (response.success && response.data) {
            console.log(startDate, endDate);
            setEvents((prevEvents) => [...prevEvents, ...(response.data || [])]);
            setLastDate(endDate);
        } else {
            Alert.alert("Error", response.message);
        }
        setIsLoading(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity >
                        <Ionicons name="cloud-upload-outline" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title} >My events</Text>

                    <TouchableOpacity onPress={() => setView(view === "list" ? "calendar" : "list")}>
                        {view == "list" ? <Ionicons name="calendar-number-outline" size={24} />
                            : <Ionicons name="list-outline" size={24} />
                        }
                    </TouchableOpacity>
                </View>
                <View style={styles.eventList}>
                    {view == "list" ?

                        <>
                        <Text style={styles.dateRange}>{new Date().toLocaleString("sk-SK", { dateStyle: "medium" })} - {lastDate.toLocaleDateString("sk-SK", { dateStyle: "medium" })}</Text>
                        <FlatList
                            data={events}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => <EventCardRow event={item} />}
                            onEndReachedThreshold={0.5}
                            numColumns={1} />
                            {isLoading ? <ActivityIndicator style={{marginTop:10}} size="large" /> : 
                                <Pressable style={styles.loadMore} onPress={loadMoreEvents}>
                                    <Text style={styles.loadMoreText}>Load more</Text>
                                </Pressable>
                            }
                        </> :
                        <>
                            <View style={styles.header}>
                                <Text>
                                    {new Date().toLocaleDateString('en-US', { month: 'long' })}
                                </Text>
                                <Ionicons name="arrow-back" />
                                <Ionicons name="arrow-forward" />
                            </View>
                            <FlatList
                                data={Array.from({ length: 7 }, (_, i) => {
                                    const today = new Date();
                                    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                                    const day = new Date(firstDayOfWeek.setDate(firstDayOfWeek.getDate() + i));
                                    return {
                                        id: i.toString(),
                                        date: day,
                                        dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
                                        month: day.toLocaleDateString('en-US', { month: 'long' }),
                                    };
                                })}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View>
                                        <View style={{ padding: 10 }}>
                                            <Text>{item.dayName}</Text>
                                            <Text>{item.date.toDateString()}</Text>
                                            <Text>{item.month}</Text>
                                        </View>
                                    </View>

                                )}
                                numColumns={1}
                            />
                        </>
                    }
                </View>
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

});