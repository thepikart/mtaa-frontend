import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import Footer from "@/components/Footer";
import { useUserStore } from "@/stores/userStore";
import { useState, useEffect } from "react";
import { BankAccountProps } from "@/types/models";
import { useMode } from "@/hooks/useMode";
import { useSystemStore } from "@/stores/systemStore";

export default function BankAccountScreen() {
    const connected = useSystemStore((state) => state.connected);
    const mode = useMode();
    const user = useUserStore((state) => state.user);
    const account = useUserStore((state) => state.bankAccount);

    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [country, setCountry] = useState("");
    const [number, setNumber] = useState("");

    const getBankAccount = async () => {
        const response = await useUserStore.getState().getBankAccount();
        if (response.success) {
            const { address, city, zip, country, number } = response.data as BankAccountProps;
            setAddress(address);
            setCity(city);
            setZip(zip);
            setCountry(country);
            setNumber(number);
        }
    }

    useEffect(() => {
        if (!connected) {
            return;
        }
        getBankAccount();
    }, [ connected ]);

    const handleSave = async () => {
        setLoading(true);
        const response = await useUserStore.getState().setBankAccount({
            address,
            city,
            zip,
            country,
            number
        });
        if (response.success) {
            Alert.alert("Success", "Bank account updated successfully.");
        }
        else {
            Alert.alert("Error", response.message);
        }
        setLoading(false);
    }

    return (
        <View style={{flex: 1, backgroundColor: mode.background}}>
            <ScrollView contentContainerStyle={{alignItems: "center"}}>
                <View style={styles.container}>
                    <Text style={[styles.requiredText, {color: mode.text}]}>Bank account is required to create paid events.</Text>
                    {!account && (
                        <Text style={styles.noAccountText}>Account not added yet!</Text>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.rowInput}>
                        <View style={styles.doubleInput}>
                            <Text style={[styles.text, {color: mode.text}]}>Name</Text>
                            <TextInput
                                style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                                editable={false}
                                value={user?.name}
                            />
                        </View>
                        <View style={styles.doubleInput}>
                            <Text style={[styles.text, {color: mode.text}]}>Surname</Text>
                            <TextInput
                                style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                                editable={false}
                                value={user?.surname}
                            />
                        </View>
                    </View>
                    <Text style={[styles.text, {color: mode.text}]}>Billing address</Text>
                    <TextInput
                        style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                        placeholder="Billing address"
                        placeholderTextColor={mode.textPlaceholder}
                        value={address}
                        onChangeText={setAddress}
                    />
                    <View style={styles.rowInput}>
                        <View style={styles.doubleInput}>
                            <Text style={[styles.text, {color: mode.text}]}>City</Text>
                            <TextInput
                                style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                                placeholder="City"
                                placeholderTextColor={mode.textPlaceholder}
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>
                        <View style={styles.doubleInput}>
                            <Text style={[styles.text, {color: mode.text}]}>ZIP Code</Text>
                            <TextInput
                                style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                                placeholder="ZIP Code"
                                placeholderTextColor={mode.textPlaceholder}
                                value={zip}
                                onChangeText={setZip}
                            />
                        </View>
                    </View>
                    <Text style={[styles.text, {color: mode.text}]}>Country</Text>
                    <TextInput
                        style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                        placeholder="Country"
                        placeholderTextColor={mode.textPlaceholder}
                        value={country}
                        onChangeText={setCountry}
                    />
                    <Text style={[styles.text, {color: mode.text}]}>Bank account number</Text>
                    <TextInput
                        style={[styles.input, {color: mode.text, borderColor: mode.borderInput}]}
                        placeholder="Bank account number"
                        placeholderTextColor={mode.textPlaceholder}
                        value={number}
                        onChangeText={setNumber}
                    />
                </View>
                <TouchableOpacity style={[styles.saveButton, {backgroundColor: mode.button}]} onPress={handleSave} disabled={loading}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
            <Footer />
            {loading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
        alignItems: "center",
    },
    requiredText: {
        fontWeight: "bold",
        fontSize: 17,
        textAlign: "center",
        marginTop: 20,
    },
    saveButton: {
        marginVertical: 50,
        width: "35%",
        maxWidth: 200,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 8,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
    },
    rowInput: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    input: {
        fontSize: 16,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    doubleInput: {
        width: "49%",
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
    },
    inputContainer: {
        width: "85%",
        marginTop: 50,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0 0 0 / 0.3)",
        zIndex: 1,
    },
    noAccountText: {
        marginTop: 5,
        fontSize: 16,
        color: "#CE0000",
        fontWeight: "bold",
    },
});