import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MyEventCardProps } from "@/types/models";
import { useMode } from "@/hooks/useMode";

export default function EventCardCalendar(props: {event: MyEventCardProps}) {
    const mode = useMode();
    const { id, title, place, date } = props.event;
    const router = useRouter();
   
    return (
        <Pressable onPress={() => router.push(`/event/${id}`)}style={[styles.container, {backgroundColor:mode.headerFooter}]}>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, {color:mode.text}]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                    <Text style={[styles.placeTime, {color:mode.text}]}>{place}, {new Date(date).toLocaleString('sk-SK', {timeStyle: "short"})}</Text>
                </View>

        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
        padding: 10,
        alignSelf: "center",
        marginHorizontal: 10,
        borderRadius: 8,
        flex: 1,
    },
    textContainer: {
        justifyContent: "center",
    },
    title: {
        fontWeight: "500",
        fontSize: 14,
    },
    placeTime: {
        fontWeight: "400",
        color: "#000000C1",
        fontSize: 13,
    }
});
