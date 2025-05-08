import { View, Text, StyleSheet, SectionList, Switch } from "react-native";
import Footer from "@/components/Footer";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message";
import { useMode } from "@/hooks/useMode";

export default function NotificationsScreen() {

    const mode = useMode();
    const navigation = useNavigation();
    const user = useUserStore((state) => state.user);
    const notifications = useUserStore((state) => state.notifications);

    const [my_attendees, setMyAttendees] = useState(notifications?.my_attendees);
    const [my_comments, setMyComments] = useState(notifications?.my_comments);
    const [my_time, setMyTime] = useState(notifications?.my_time);
    const [reg_attendees, setRegAttendees] = useState(notifications?.reg_attendees);
    const [reg_comments, setRegComments] = useState(notifications?.reg_comments);
    const [reg_time, setRegTime] = useState(notifications?.reg_time);
    const [all, setAll] = useState(false);
    
    const pauseAll = () => {
        setAll((prevAll) => {
            const newAll = !prevAll;
            if (newAll) {
                setMyAttendees(false);
                setMyComments(false);
                setMyTime(false);
                setRegAttendees(false);
                setRegComments(false);
                setRegTime(false);
            } else {
                setMyAttendees(notifications?.my_attendees);
                setMyComments(notifications?.my_comments);
                setMyTime(notifications?.my_time);
                setRegAttendees(notifications?.reg_attendees);
                setRegComments(notifications?.reg_comments);
                setRegTime(notifications?.reg_time);
            }
            return newAll;
        });
    };

    const updateNotifications = async () => {
        const result = await useUserStore.getState().updateNotifications({
            my_attendees: my_attendees,
            my_comments: my_comments,
            my_time: my_time,
            reg_attendees: reg_attendees,
            reg_comments: reg_comments,
            reg_time: reg_time,
        });
        if (result.success) {
            Toast.show({
                type: "success",
                text1: "✅    Notifications updated successfully!",
                onPress: () => Toast.hide(),
                visibilityTime: 2500,
            });
        }
        else {
            Toast.show({
                type: "error",
                text1: `❌    ${result.message}`,
                onPress: () => Toast.hide(),
                visibilityTime: 2500,
            });
        }
    }
    
    useEffect(() => {
        const newState = (
            my_attendees !== notifications?.my_attendees ||
            my_comments !== notifications?.my_comments ||
            my_time !== notifications?.my_time ||
            reg_attendees !== notifications?.reg_attendees ||
            reg_comments !== notifications?.reg_comments ||
            reg_time !== notifications?.reg_time
        );

        const unsubscribeBlur = navigation.addListener("blur", () => {
            if (newState) updateNotifications();
        });

        const unsubscribeBeforeRemove = navigation.addListener("beforeRemove", () => {
            if (newState) updateNotifications();
        });

        return () => {
            unsubscribeBlur();
            unsubscribeBeforeRemove();
        };
    }, [my_attendees, my_comments, my_time, reg_attendees, reg_comments, reg_time, notifications]);
      

    const options = [
        {
            id: 1, title: "Events you created", data: [
                { id: 1, title: "Attendees", value: my_attendees, setValue: setMyAttendees },
                { id: 2, title: "Comments", value: my_comments, setValue: setMyComments },
                { id: 3, title: "Time", value: my_time, setValue: setMyTime },
            ]
        },
        {
            id: 2, title: "Events you are going to", data: [
                { id: 1, title: "Attendees", value: reg_attendees, setValue: setRegAttendees },
                { id: 2, title: "Comments", value: reg_comments, setValue: setRegComments },
                { id: 3, title: "Time", value: reg_time, setValue: setRegTime },
            ]
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: mode.background }]}>
            <View style={styles.container}>
                <View style={styles.option}>
                    <Text style={[styles.optionText, {color:mode.text}]}>Pause all notifications</Text>
                    <Switch value={all} onValueChange={() => pauseAll()} />
                </View>
                <SectionList
                    sections={options}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={[styles.option, {borderBottomColor: mode.border}]}>
                            <Text style={[styles.optionText, {color:mode.text}]}>{item.title}</Text>
                            <Switch value={item.value} onValueChange={item.setValue} disabled={all}/>
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={[styles.optionHeader, {color: mode.text, borderBottomColor: mode.border}]}>{title}</Text>
                    )}
                />
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
    option: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    optionText: {
        fontSize: 15,
    },
    optionHeader: {
        marginTop: 20,
        fontSize: 17,
        fontWeight: "bold",
        padding: 14,
        borderBottomWidth:1,
    }
});