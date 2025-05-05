import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { EventCardProps } from "@/types/models";
import { formatDate } from "@/utils/date";
import { useMode } from "@/hooks/useMode";

export default function EventCardColumn(props: {event: EventCardProps}) {
    const { id, title, place, date, description, photo } = props.event;
    const router = useRouter();
    const mode = useMode();
   
    return (
        <Pressable onPress={() => router.push(`/event/${id}`)}style={[styles.container, {borderColor: mode.border}]}>
            <View >
                <Image style={styles.image} source={{ uri: photo }} />
                <Text style={[styles.title, {color:mode.text}]}>{title}</Text>
                <Text style={{color:mode.text}}>{place}, {formatDate(date)}</Text>
                <Text style={[styles.desc, {color:mode.text}]}>{description}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "50%",
        borderWidth: 1,
        borderColor: "rgb(221 221 221)",
        borderStyle: "solid",
        padding: 15,
        alignSelf: "flex-start",
        height: "100%",
    },
    title: {
        fontWeight: "500",
        marginBottom: 2,
        fontSize: 16,
    },
    desc: {
        fontWeight: "300",
        color: "#000000C1",
        marginTop: 5,
        fontSize: 13,
    },
    image: {
        width: "100%",
        height: 107,
        marginBottom: 10,
    },
});