import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useUserStore } from "@/stores/userStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import Footer from "@/components/Footer";
import EventCardColumn from "@/components/EventCardColumn";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProfilePhoto from "@/components/ProfilePhoto";
import { useEffect, useState } from "react";
import { User } from "@/types/models";

export default function ProfileScreen() {

    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const { profileId } = useLocalSearchParams<{ profileId: string }>();
    const [userProfile, setUserProfile] = useState<User | null>(null);

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
                    <ProfilePhoto size={96} borderRadius={100} fontSize={32} id={userProfile.id} name={userProfile.name} surname={userProfile.surname}/>
                )}
                <View style={styles.userInfoText}>
                    <Text style={styles.name}>{userProfile?.name} {userProfile?.surname}</Text>
                    <Text style={styles.bio}>{userProfile?.bio}</Text>
                </View>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.button}>
                    <Text>Created events</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text>Going to</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.list}>
                {/* <EventCardColumn  />
                <EventCardColumn />*/}
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
    list: {
        flex: 1,
        flexDirection: "row",
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
        borderColor: "#D9D9D9",
    }
});