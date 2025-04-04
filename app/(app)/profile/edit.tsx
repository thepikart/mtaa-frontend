import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import Footer from "@/components/Footer";
import { useUserStore } from "@/stores/userStore";
import calculateColor from "@/utils/pfp";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {

    const user = useUserStore((state) => state.user);

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [surname, setSurname] = useState(user?.surname || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [imageResult, setImageResult] = useState(Object.create(null));

    const newState = () => {
        return (
            name !== user?.name ||
            surname !== user?.surname ||
            username !== user?.username ||
            bio !== user?.bio ||
            imageResult.uri !== undefined
        );
    }
    const loadImage = () => {
        if (user?.photo && user.photo.includes(`photos/user_${user.id}`)) {
            return process.env.EXPO_PUBLIC_BASE_URL + "/" + user.photo;
        }
        else {
            return user?.photo || undefined;
        }
    }

    const calculateFooterColor = () => {
        if (!user) {
            return "#BCBCBC";
        }
        else {
            return calculateColor(user.name, user.surname);
        }
    }

    const handleImagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageResult(result.assets[0]);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        let data = new FormData();
        data.append("name", name);
        data.append("surname", surname);
        data.append("username", username);
        data.append("bio", bio);

        if (imageResult.uri) {
            data.append("photo", {
                uri: imageResult.uri,
                name: imageResult.fileName,
                type: `image/${imageResult.type}`,
            } as any);
        }
        const result = await useUserStore.getState().editUser(data);
        if (!result.success) {
            setImageResult(Object.create(null));
            Alert.alert("Error", result.message);
        }
        else {
            setImageResult(Object.create(null));
            Alert.alert("Success", "Profile updated successfully!");
        }
        setLoading(false);
    }

    const options = [
        { id: 1, title: "Name: ", value: name, onChange: setName },
        { id: 2, title: "Surname: ", value: surname, onChange: setSurname },
        { id: 3, title: "Username: ", value: username, onChange: setUsername },
        { id: 4, title: "Bio: ", value: bio, onChange: setBio },
    ];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <View style={styles.editImage}>
                    <TouchableOpacity onPress={handleImagePicker}>
                        {imageResult.uri ? (
                            <Image style={styles.pfpImage} src={imageResult.uri} />
                        ) : loadImage() ? (
                            <Image style={styles.pfpImage} src={loadImage()} />
                        ) : (
                            <Text style={[styles.pfpInitials, { backgroundColor: calculateFooterColor() }]}>{user?.name?.[0].toUpperCase()}{user?.surname?.[0].toUpperCase()}</Text>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.editImageText} onPress={handleImagePicker}>Edit profile photo</Text>
                </View>
                <View style={styles.options}>
                    {options.map((item) => (
                        <View key={item.id} style={styles.option}>
                            <Text style={styles.optionText}>{item.title}</Text>
                            <TextInput
                                style={styles.optionTextInput}
                                value={item.value}
                                onChangeText={item.onChange}
                                multiline={item.id === 4}
                            />
                        </View>
                    ))}
                </View>
                <TouchableOpacity style={[styles.saveButton, (!newState() || loading) ? styles.disabledSaveButton : null]} onPress={handleSave} disabled={!newState() || loading}>
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
    pfpInitials: {
        width: 100,
        height: 100,
        borderRadius: 100,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 32,
    },
    pfpImage: {
        width: 100,
        height: 100,
        borderRadius: 100,
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
    },
    editImage: {
        alignItems: "center",
        marginTop: 40,
    },
    editImageText: {
        marginTop: 20,
        fontSize: 16,
        color: "#004691",
        fontWeight: "500",
    },
    options: {
        marginTop: 30,
        borderWidth: 1,
        borderColor: "#0000002B",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    option: {
        paddingVertical: 7,
        flexDirection: "row",
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },
    optionTextInput: {
        fontSize: 16,
        flex: 2,
        borderBottomWidth: 1,
        borderBottomColor: "#0000002B",
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
    disabledSaveButton: {
        backgroundColor: "#0000002B",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
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
    }
});