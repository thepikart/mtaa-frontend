import { Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useMode } from "@/hooks/useMode";

export default function RegisterScreen() {
    const mode = useMode();
    const router = useRouter();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleCreateAcconut = async () => {
        const createAccountProps = {
            name,
            surname,
            username,
            email,
            password,
        };
        const result = await useUserStore.getState().createAccount(createAccountProps);
        if (result.success) {
            router.replace("/home");
        }
        else {
            Alert.alert("Create Account Error", result.message);
        }
    }

    return (
        <ScrollView contentContainerStyle={[styles.contentContainer, { backgroundColor: mode.background }]}>
            <Text style={[styles.headerText, { color: mode.text }]}>Eventix</Text>
            <View style={styles.inputContainer}>
                <Text style={[styles.text, { color: mode.text }]}>Name</Text>
                <TextInput
                    style={[styles.input, {borderColor: mode.borderInput, color: mode.text}]}
                    placeholderTextColor={mode.textPlaceholder}
                    placeholder="Name" value={name}
                    onChangeText={setName} />
                <Text style={[styles.text, { color: mode.text }]}>Surname</Text>
                <TextInput
                    style={[styles.input, {borderColor: mode.borderInput, color: mode.text}]}
                    placeholderTextColor={mode.textPlaceholder}
                    placeholder="Surname"
                    value={surname}
                    onChangeText={setSurname} />
                <Text style={[styles.text, { color: mode.text }]}>Username</Text>
                <TextInput
                    style={[styles.input, {borderColor: mode.borderInput, color: mode.text}]}
                    placeholderTextColor={mode.textPlaceholder}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername} />
                <Text style={[styles.text, { color: mode.text }]}>Email</Text>
                <TextInput
                style={[styles.input, {borderColor: mode.borderInput, color: mode.text}]}
                placeholderTextColor={mode.textPlaceholder}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail} />
                <Text style={[styles.text, { color: mode.text }]}>Password</Text>
                <TextInput 
                style={[styles.input, {borderColor: mode.borderInput, color: mode.text}]}
                placeholderTextColor={mode.textPlaceholder}
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={setPassword} />
                <Text style={[styles.text, { color: mode.text }]}>Repeat password</Text>
                <TextInput 
                style={[styles.input, {borderColor: mode.borderInput, color: mode.text}]}
                placeholderTextColor={mode.textPlaceholder}
                    placeholder="Repeat password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false} />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => { handleCreateAcconut() }}>
                <Text style={styles.buttonText}>Create account</Text>
            </TouchableOpacity>
            <View style={styles.redirectContainer}>
                <Text style={[styles.redirectText, { color: mode.text }]}>Already have an account? </Text>
                <Text style={[styles.redirectLink, { color: mode.text }]} onPress={() => router.replace('/login')}>Log in</Text>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    headerText: {
        fontSize: 34,
        fontWeight: "500",
        marginBottom: "10%",
    },
    input: {
        fontSize: 16,
        height: 40,
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
        width: "40%",
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
        marginTop: "10%",
    },
    redirectText: {
        fontSize: 16,
    },
    redirectLink: {
        fontSize: 16,
        textDecorationLine: "underline",
    },
});
