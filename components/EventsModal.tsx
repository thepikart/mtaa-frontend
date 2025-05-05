import { StyleSheet, Modal, View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MyEventCardProps } from "@/types/models";
import { useMode } from "@/hooks/useMode";

export default function EventsModal(props: { modalVisible: boolean, events: MyEventCardProps[], setModalVisible: (visible: boolean) => void }) {
    const { modalVisible, events, setModalVisible } = props;
    const router = useRouter();
    const mode = useMode();
    
    const newDate = new Date(events[0]?.date).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.container}>
                <View style={[styles.content, { backgroundColor: mode.headerFooter }]}>
                    <Text style={[styles.title, {color:mode.text}]}>{newDate}</Text>
                    <FlatList
                        data={events}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.item}
                                onPress={() => {
                                    setModalVisible(false);
                                    router.push(`/event/${item.id}`);
                                }}
                            >
                                <Text style={[styles.itemTitle, {color:mode.text}]}>{item.title}</Text>
                                <Text style={styles.itemPlace}>{item.place}</Text>
                                <Text style={styles.itemDate}>
                                    {new Date(item.date).toLocaleDateString("en-US", {
                                        dateStyle: "medium",
                                    })}
                                </Text>
                            </Pressable>
                        )}
                    />
                    <Pressable
                        style={styles.button}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    content: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    item: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        width: "100%",
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    itemPlace: {
        fontSize: 14,
        color: "#555",
    },
    itemDate: {
        fontSize: 12,
        color: "#999",
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#F7863B",
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});