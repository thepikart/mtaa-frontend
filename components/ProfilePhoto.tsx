import { Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useUserStore } from "@/stores/userStore";
import calculateColor from "@/utils/pfp";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function ProfilePhoto(props: { size: number; borderRadius: number, fontSize: number, id: number, name: string, surname: string }) {
    const router = useRouter();
    const [photo, setPhoto] = useState<string | undefined>(undefined);

    useEffect(() => {
        const loadPhoto = async () => {
                const response = await useUserStore.getState().getPhoto(props.id);
                if (response.success) {
                    setPhoto(response.data);
                }
        };
        loadPhoto();
    }, [photo]);

    const calculateFooterColor = () => {
        if (!props.id) return "#BCBCBC";
        return calculateColor(props.name, props.surname);
    };

    return (
        <TouchableOpacity onPress={() => router.push(`/profile/${props.id}`)}>
            {photo ? (
                <Image
                    style={{ width: props.size, height: props.size, borderRadius: props.borderRadius }}
                    source={{ uri: photo }}
                />
            ) : (
                <Text
                    style={[styles.pfpInitials,
                    {
                        width: props.size,
                        height: props.size,
                        borderRadius: props.borderRadius,
                        fontSize: props.fontSize,
                        backgroundColor: calculateFooterColor()
                    }]}>
                    {props.name?.[0]?.toUpperCase()}
                    {props.surname?.[0]?.toUpperCase()}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pfpInitials: {
        textAlign: "center",
        textAlignVertical: "center",
    },
});
