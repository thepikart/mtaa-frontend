import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, ActivityIndicator } from "react-native";
import { useUserStore } from "@/stores/userStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import Footer from "@/components/Footer";
import EventCardColumn from "@/components/EventCardColumn";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProfilePhoto from "@/components/ProfilePhoto";
import { useEffect, useState } from "react";
import { User } from "@/types/models";
import { useEventStore } from "@/stores/eventStore";
import { EventCardProps } from "@/types/models";

export default function ProfileScreen() {

    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const { profileId } = useLocalSearchParams<{ profileId: string }>();

    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [active, setActive] = useState<"created" | "registered">("created");

    const [createdEvents, setCreatedEvents] = useState<EventCardProps[]>([]);
    const [registeredEvents, setRegisteredEvents] = useState<EventCardProps[]>([]);
    const [createdOffset, setCreatedOffset] = useState(0);
    const [registeredOffset, setRegisteredOffset] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreCreated, setHasMoreCreated] = useState(true);
    const [hasMoreRegistered, setHasMoreRegistered] = useState(true);

    useEffect(() => {
        const getUserProfile = async () => {
            if (profileId) {
                const response = await useUserStore.getState().getUserProfile(Number(profileId));
                if (response.success && response.data) {
                    setUserProfile(response.data);
                } else {
                    Alert.alert("Error", response.message);
                    router.back();
                }
            } else {
                Alert.alert("Error", "No profile ID provided");
                router.back();
            }
        }
        getUserProfile();
    }, [profileId]);

    useEffect(() => {
        if (userProfile) {
            if (active === "created" && createdEvents.length === 0) {
                loadEvents("created", 0);
            }
            else if (active === "registered" && registeredEvents.length === 0) {
                loadEvents("registered", 0);
            }
        }
    }, [active, userProfile]);

    const loadEvents = async (type: "created" | "registered", offset: number) => {
        if (!userProfile || isLoading ) return;

        var response: any;

        if (type == "created") {
            if (!hasMoreCreated) {
                return;
            }
            setIsLoading(true);
            response = await useEventStore.getState().getUserEventsCreated(userProfile.id, 10, offset);
            if (response.success && response.data) {
                setCreatedEvents([...createdEvents, ...response.data]);
                setCreatedOffset(offset + 10);
                if (response.data.length < 10) {
                    setHasMoreCreated(false);
                }
            }
            else {
                Alert.alert("Error", response.message);
            }
        }
        else {
            if (!hasMoreRegistered) {
                return;
            }
            setIsLoading(true);
            response = await useEventStore.getState().getUserEventsRegistered(userProfile.id, 10, offset);
            if (response.success && response.data) {
                setRegisteredEvents([...registeredEvents, ...response.data]);
                setRegisteredOffset(offset + 10);
                if (response.data.length < 10) {
                    setHasMoreRegistered(false);
                }
            }
            else {
                Alert.alert("Error", response.message);
            }
        }
        setIsLoading(false);
    };

    var events;
    var offset: number;
    if (active === "created") {
        events = createdEvents;
        offset = createdOffset;
    }
    else {
        events = registeredEvents;
        offset = registeredOffset;
    }

    return (
        userProfile &&
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.username}>{userProfile?.username}</Text>
                {user?.id == userProfile?.id && <TouchableOpacity onPress={() => router.push("/profile/settings")}>
                    <Ionicons name="settings-sharp" size={24} />
                </TouchableOpacity>}
            </View>
            <View style={styles.userInfo}>
                {userProfile && (
                    <ProfilePhoto size={96} borderRadius={100} fontSize={32} id={userProfile.id} name={userProfile.name} surname={userProfile.surname} />
                )}
                <View style={styles.userInfoText}>
                    <Text style={styles.name}>{userProfile?.name} {userProfile?.surname}</Text>
                    <Text style={styles.bio}>{userProfile?.bio}</Text>
                </View>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={[styles.button, active=="created" ? styles.active : null]} onPress={() => setActive("created")}>
                    <Text>Created events</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, active=="registered" ? styles.active : null]} onPress={() => setActive("registered")}>
                    <Text>Going to</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <EventCardColumn event={item} />}
                onEndReached={() => {
                    if (!isLoading && (active === "created" ? hasMoreCreated : hasMoreRegistered)) {
                        loadEvents(active, offset);
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 10 }} size="large"/> : null}
                numColumns={2}
            />
            
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
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: "100%",
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
    },
    userInfo: {
        flexDirection: "row",
        width: "100%",
        padding: 15,
    },
    userInfoText: {
        marginLeft: 10,
        flex: 1,
    },
    bio: {
        paddingTop: 5,
    },
    name: {
        fontWeight: "500",
    },
    buttons: {
        flexDirection: "row",
    },
    button: {
        width: "50%",
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderWidth: 1,
        borderColor: "#A5A5A5",
    },
    active: {
        backgroundColor: "#D7D7D7",
    }
});