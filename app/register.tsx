import { Text, View, TextInput, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useUserStore } from "@/stores/userStore";

export default function RegisterScreen() {
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
        <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headerText}>Eventix</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.text}>Name</Text>
                <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
                <Text style={styles.text}>Surname</Text>
                <TextInput style={styles.input} placeholder="Surname" value={surname} onChangeText={setSurname} />
                <Text style={styles.text}>Username</Text>
                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
                <Text style={styles.text}>Email</Text>
                <TextInput style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail} />
                <Text style={styles.text}>Password</Text>
                <TextInput style={styles.input}
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={setPassword} />
                <Text style={styles.text}>Repeat password</Text>
                <TextInput style={styles.input}
                    placeholder="Repeat password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false} />
            </View>
            <Pressable style={styles.button} onPress={() => { handleCreateAcconut() }}>
                <Text style={styles.buttonText}>Create account</Text>
            </Pressable>
            <View style={styles.redirectContainer}>
                <Text style={styles.redirectText}>Already have an account? </Text>
                <Text style={styles.redirectLink} onPress={() => router.replace('/login')}>Log in</Text>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: "5%",
    },
    headerText: {
        fontSize: 34,
        fontWeight: "500",
        marginBottom: "10%",
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
