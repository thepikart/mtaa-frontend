import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMode } from '@/hooks/useMode';

export default function ConfirmationModal(props: { message: string, visible: boolean, onClose: (confirmed: boolean) => void }) {
    const mode = useMode();
    return (
        <Modal
            transparent={true}
            visible={props.visible}
            onRequestClose={() => props.onClose(false)}
        >
            <View style={styles.container}>
                <View style={[styles.content, { backgroundColor: mode.headerFooter }]}>
                    <View style={styles.closeButton}>
                        <Pressable onPress={() => props.onClose(false)}>
                            <Ionicons name="close" size={35} color={mode.text} />
                        </Pressable>
                    </View>
                    <Text style={[styles.text, {color: mode.text}]} >{props.message}</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.noButton} onPress={() => props.onClose(false)}>
                            <Text style={styles.buttonText} >No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.yesButton} onPress={() => props.onClose(true)}>
                            <Text style={styles.buttonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
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
        height: "30%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        justifyContent: "space-between",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginTop: 20,
    },
    yesButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        padding: 8,
        borderRadius: 8,
        width: "40%",
        alignItems: "center",
    },
    noButton: {
        backgroundColor: "#EC221F",
        color: "white",
        padding: 8,
        borderRadius: 8,
        width: "40%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    closeButton: {
        flexDirection: "row",
        justifyContent: "flex-end",
        width: "100%",
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    }
});