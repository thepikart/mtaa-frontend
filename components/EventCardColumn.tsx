import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEventStore } from "@/stores/eventStore";
import { useEffect, useState } from "react";

export default function EventCardColumn(props: { id: number, title: string, date: string, place: string, desc: string }) {
    const router = useRouter();
    const [photo, setPhoto] = useState<string | undefined>(undefined);
   
    useEffect(() => {
        const loadPhoto = async () => {
            if (props.id) {
                const response = await useEventStore.getState().getEventPhoto(props.id);
                if (response.success) {
                    setPhoto(response.data);
                }
            }
        };
        loadPhoto();
    }, [props.id]);

    return (
        <TouchableOpacity onPress={() => router.push(`/event/${props.id}`)}>
            <View style={styles.container}>
                <Image style={styles.image} source={{ uri: photo }} />
                <Text style={styles.title}>{props.title}</Text>
                <Text>{props.place}, {props.date}</Text>
                <Text style={styles.desc}>{props.desc}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "50%",
        borderWidth: 1,
        borderColor: "#0000002B",
        borderStyle: "solid",
        padding: 15,
        alignSelf: "flex-start"
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