import { Text, View, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useState } from "react";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const result = await useUserStore.getState().login(email, password);
    
        if (result.success) {
            router.replace("/home");
        }
        else {
            Alert.alert("Login Error", result.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Eventix</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.text}>Email</Text>
                <TextInput style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                />
                <Text style={styles.text}>Password</Text>
                <TextInput style={styles.input}
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={setPassword} />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => { handleLogin() }}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <View style={styles.redirectContainer}>
                <Text style={styles.redirectText}>Not a user yet? </Text>
                <Text style={styles.redirectLink} onPress={() => router.replace('/register')}>Create account</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 34,
        fontWeight: "500",
        marginBottom: "20%",
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
    text: {
        fontSize: 16,
        marginBottom: 8,
    },
    inputContainer: {
        width: "80%",
        maxWidth: 400,
    },
    button: {
        marginTop: 9,
        width: "35%",
        maxWidth: 200,
        height: 40,
        backgroundColor: "#000000",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    redirectContainer: {
        flexDirection: "row",
        marginTop: 37,
    },
    redirectText: {
        fontSize: 16,
    },
    redirectLink: {
        fontSize: 16,
        textDecorationLine: "underline",
    },
});
