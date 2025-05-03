import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MyEventCardProps } from "@/types/models";
import { formatDate } from "@/utils/date";
import { useUserStore } from "@/stores/userStore";
import Feather from '@expo/vector-icons/Feather';

export default function EventCardRow(props: { event: MyEventCardProps }) {
    const { id, title, place, date, description, photo, creator } = props.event;
    const router = useRouter();

    return (
        <Pressable onPress={() => router.push(`/event/${id}`)} style={styles.container}>
            <View style={styles.row}>
                <Image style={styles.image} source={{ uri: photo }} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text>{place}, {formatDate(date)}</Text>
                    <Text style={styles.desc}>{description}</Text>
                </View>
                {creator === true && (
                    <Pressable onPress={() => router.push(`/event/${id}/edit`)} >
                        <Feather name="edit" size={22}/>
                    </Pressable>)
                }
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderWidth: 1,
        borderColor: "rgb(221 221 221)",
        borderStyle: "solid",
        padding: 15,
        height: "auto",
        marginVertical: 5,
    },
    row: {
        flexDirection: "row",
        width: "100%",
        height: 107,
    },
    textContainer: {
        padding: 15,
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