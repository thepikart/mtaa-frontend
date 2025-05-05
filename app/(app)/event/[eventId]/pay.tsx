import { View, Text, StyleSheet, Image, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useEventStore } from "@/stores/eventStore";
import { useUserStore } from '@/stores/userStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { formatDate } from '@/utils/date';
import { useConfirmation } from '@/hooks/useConfirm';
import { useMode } from '@/hooks/useMode';

export default function PayScreen() {
    const mode = useMode();
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const event = useEventStore((state) => state.eventToPay);
    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    const [cardNumber, setCardNumber] = useState("");
    const [cvv, setCvv] = useState("");
    const [expiration, setExpiration] = useState("");

    const { confirm, Confirmation } = useConfirmation();

    if (!event || event.id != Number(eventId)) {
        router.back();
        return null;
    }

    const handlePayment = async () => {
        const confirmed = await confirm("Are you sure you want to pay for this event?");
        if (!confirmed) {
            return;
        }
        const data = {
            cardHolder: `${user?.name} ${user?.surname}`,
            cardNumber,
            cvv,
            expiration,
        };
        const response = await useEventStore.getState().registerForEvent(event.id, data);
        if (response.success) {
            useEventStore.getState().setEventToPay(null);
            Alert.alert("Success", "You have successfully registered for the event.");
            router.push("/my-events");
        }
        else {
            Alert.alert("Error", response.message);
        }
    }

    return (
        <View style={[styles.viewContainer, { backgroundColor: mode.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.row}>
                    <Image style={styles.image} source={{ uri: event.photo }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, {color: mode.text}]}>{event.name}</Text>
                        <Text style={{color: mode.text}}>{event.place}, {formatDate(event.date)}</Text>
                        <Text style={[styles.desc, {color: mode.text}]} numberOfLines={5} ellipsizeMode="tail">{event.description}</Text>
                    </View>
                </View>
                <View style={styles.priceRow}>
                    <Text style={[styles.priceText, {color: mode.text}]}>Price:</Text>
                    <Text style={[styles.priceText, {color: mode.text}]}>{event.price} €</Text>
                </View>
                <View style={styles.inputView}>
                    <Text style={[styles.paymentTitle, {color: mode.text}]}>Payment details</Text>
                    <Text style={[styles.text, {color: mode.text}]} >Name on the card</Text>
                    <TextInput
                        style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                        value={`${user?.name} ${user?.surname}`}
                        placeholder="Name on the card"
                        placeholderTextColor={mode.textPlaceholder}
                        editable={false} />
                    <Text style={[styles.text, {color: mode.text}]}>Card number</Text>
                    <TextInput
                        style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        placeholder="Card number"
                        placeholderTextColor={mode.textPlaceholder}
                        keyboardType="numeric"
                        maxLength={16} />
                    <View style={styles.inputRow}>
                        <View style={styles.oneInputInRow}>
                            <Text style={[styles.text, {color: mode.text}]}>CVV</Text>
                            <TextInput
                                style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                                value={cvv}
                                onChangeText={setCvv}
                                placeholder="CVV"
                                placeholderTextColor={mode.textPlaceholder}
                                keyboardType="numeric"
                                maxLength={3} />
                        </View>
                        <View style={styles.oneInputInRow}>
                            <Text style={[styles.text,{color: mode.text}]}>Expiration</Text>
                            <TextInput
                                style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                                value={expiration}
                                onChangeText={setExpiration}
                                placeholder="MM/YY"
                                placeholderTextColor={mode.textPlaceholder}
                                maxLength={5} />
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={handlePayment} style={styles.button}>
                    <Text style={styles.buttonText}>Pay</Text>
                </TouchableOpacity>
            </ScrollView>
            <Confirmation />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
    viewContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    row: {
        marginVertical: 5,
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
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        width: "100%",
    },
    priceText: {
        fontWeight: "bold",
        fontSize: 18,
    },
    inputView: {
        borderTopColor: "#ccc",
        borderTopWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 15,
        paddingVertical: 25,
        width: "100%",
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        height: 40,
        borderColor: "#D9D9D9",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    oneInputInRow: {
        width: "45%",
    },
    button: {
        marginVertical: 9,
        width: "35%",
        maxWidth: 200,
        height: 40,
        backgroundColor: "#14AE5C",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#009951",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});