import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Linking } from "react-native";
import Footer from "@/components/Footer";
import { useUserStore } from "@/stores/userStore";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import ProfilePhoto from "@/components/ProfilePhoto";
import { useMode } from "@/hooks/useMode";
import * as ImageManipulator from "expo-image-manipulator";

export default function EditProfileScreen() {
    const mode = useMode();
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

    const handleImagePicker = async () => {
        const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted' && !canAskAgain) {
            Alert.alert(
                "Permission Required",
                "Please enable gallery access in settings to add a photo.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Open Settings",
                        onPress: () => {
                            Linking.openSettings();
                        },
                    },
                ]
            );
            return;
        }
        else if (status !== 'granted') {
            Alert.alert("Permission", "Gallery permission is required to add a photo.");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            const manipulated = await ImageManipulator.manipulateAsync(
                asset.uri, [{
                    resize: { width: 400, height: 400 },
                }], {
                compress: 0.5,}
            );
            setImageResult({
                uri: manipulated.uri,
                fileName: asset.fileName,
                type: asset.type,
            });
        }

        else {
            setImageResult(Object.create(null));
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
        <View style={{ flex: 1, backgroundColor: mode.background }}>
            <ScrollView>
                <View style={styles.editImage}>
                    <TouchableOpacity onPress={handleImagePicker}>
                        {imageResult.uri ? (
                            <Image style={styles.pfpImage} src={imageResult.uri} />
                        ) : user ? <ProfilePhoto size={100} borderRadius={100} fontSize={32} id={user.id} name={user.name} surname={user.surname} photo={user.photo} /> : null}
                    </TouchableOpacity>
                    <Text style={[styles.editImageText, { color: mode.blueText }]} onPress={handleImagePicker}>Edit profile photo</Text>
                </View>
                <View style={[styles.options, { borderBottomColor: mode.border, borderTopColor: mode.border }]}>
                    {options.map((item) => (
                        <View key={item.id} style={styles.option}>
                            <Text style={[styles.optionText, { color: mode.text }]}>{item.title}</Text>
                            <TextInput
                                style={[styles.optionTextInput, { color: mode.text, borderBottomColor: mode.border }]}
                                value={item.value}
                                onChangeText={item.onChange}
                                multiline={item.id === 4}
                            />
                        </View>
                    ))}
                </View>
                <TouchableOpacity style={[styles.saveButton, (!newState() || loading) ? { backgroundColor: mode.disabledSaveButton } : { backgroundColor: mode.button }]} onPress={handleSave} disabled={!newState() || loading}>
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
        fontWeight: "500",
    },
    options: {
        marginTop: 30,
        borderTopWidth: 1,
        borderBottomWidth: 1,
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
        fontWeight: "600",
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