import { View, Text, Image, StyleSheet } from "react-native";

export default function EventCardColumn() {

    return (
        <View style={styles.container}>
            <Image style={styles.image} src={"https://placehold.co/600x400/png" } />
            <Text style={styles.title}>Title</Text>
            <Text>Place, date</Text>
            <Text style={styles.desc}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "50%",
        borderWidth: 1,
        borderColor: "#0000002B",
        borderStyle: "solid",
        padding: 15,
        alignSelf: "flex-start"
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
        width: "100%",
        height: 107,
        marginBottom: 10,
    },
});