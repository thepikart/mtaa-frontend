import { Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useUserStore } from "@/stores/userStore";
import calculateColor from "@/utils/pfp";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function ProfilePhoto(props: { size: number; borderRadius: number, fontSize: number }) {
    const user = useUserStore((state) => state.user);
    const router = useRouter();
    const [photo, setPhoto] = useState<string | undefined>(undefined);

    useEffect(() => {
        const loadPhoto = async () => {
            if (user?.photo) {
                const response = await useUserStore.getState().getPhoto(user.id);
                if (response.success) {
                    setPhoto(response.data);
                }
            }
        };
        loadPhoto();
    }, [user]);

    const calculateFooterColor = () => {
        if (!user) return "#BCBCBC";
        return calculateColor(user.name, user.surname);
    };

    return (
        <TouchableOpacity onPress={() => router.push(`/profile/${user?.id}`)}>
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
                    {user?.name?.[0]?.toUpperCase()}
                    {user?.surname?.[0]?.toUpperCase()}
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
