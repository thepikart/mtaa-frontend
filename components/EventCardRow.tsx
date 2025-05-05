import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MyEventCardProps } from "@/types/models";
import { formatDate } from "@/utils/date";
import { useUserStore } from "@/stores/userStore";
import Feather from '@expo/vector-icons/Feather';
import { useMode } from "@/hooks/useMode";

export default function EventCardRow(props: { event: MyEventCardProps }) {
    const mode = useMode();
    const { id, title, place, date, description, photo, creator } = props.event;
    const router = useRouter();

    return (
        <Pressable onPress={() => router.push(`/event/${id}`)} style={[styles.container, {borderTopColor: mode.border, borderBottomColor: mode.border, backgroundColor: mode.background}]}>
            <View style={styles.row}>
                <Image style={styles.image} source={{ uri: photo }} />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, {color: mode.text}]}>{title}</Text>
                    <Text style={{color: mode.text}}>{place}, {formatDate(date)}</Text>
                    <Text style={[styles.desc, {color: mode.text}]}>{description}</Text>
                </View>
                {creator === true && (
                    <Pressable onPress={() => router.push(`/event/${id}/edit`)} >
                        <Feather name="edit" size={22} color={mode.text}/>
                    </Pressable>)
                }
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderStyle: "solid",
        padding: 15,
        height: "auto",
        marginVertical: 5,
    },
    row: {
        flexDirection: "row",
        width: "100%",
        height: "auto",
    },
    textContainer: {
        padding: 10,
        width: "60%",
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
        width: "35%",
        height: "100%",
    },
});