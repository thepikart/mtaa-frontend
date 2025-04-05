import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import Footer from "@/components/Footer";
import { useUserStore } from "@/stores/userStore";
import { useState, useEffect } from "react";
import { BankAccountProps } from "@/types/models";

export default function BankAccountScreen() {

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
        getBankAccount();
    }, []);

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
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={{alignItems: "center"}}>
                <View style={styles.container}>
                    <Text style={styles.requiredText}>Bank account is required to create paid events.</Text>
                    {!account && (
                        <Text style={styles.noAccountText}>Account not added yet!</Text>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.rowInput}>
                        <View style={styles.doubleInput}>
                            <Text style={styles.text}>Name</Text>
                            <TextInput
                                style={styles.input}
                                editable={false}
                                value={user?.name}
                            />
                        </View>
                        <View style={styles.doubleInput}>
                            <Text style={styles.text}>Surname</Text>
                            <TextInput
                                style={styles.input}
                                editable={false}
                                value={user?.surname}
                            />
                        </View>
                    </View>
                    <Text style={styles.text}>Billing address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Billing address"
                        value={address}
                        onChangeText={setAddress}
                    />
                    <View style={styles.rowInput}>
                        <View style={styles.doubleInput}>
                            <Text style={styles.text}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>
                        <View style={styles.doubleInput}>
                            <Text style={styles.text}>ZIP Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ZIP Code"
                                value={zip}
                                onChangeText={setZip}
                            />
                        </View>
                    </View>
                    <Text style={styles.text}>Country</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Country"
                        value={country}
                        onChangeText={setCountry}
                    />
                    <Text style={styles.text}>Bank account number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Bank account number"
                        value={number}
                        onChangeText={setNumber}
                    />
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
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
        backgroundColor: "#000000",
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
        borderColor: "#D9D9D9",
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