import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { EventCardProps } from "@/types/models";
import { formatDate } from "@/utils/date";
import { useMode } from "@/hooks/useMode";


export default function SearchResultCard({ event }: { event: EventCardProps }) {
  const router = useRouter();
  const mode   = useMode();

  const { id, title, name, place, date, description, photo } = event;
  const headline = title ?? name ?? "Untitled";

  return (
    <Pressable
      onPress={() => router.push(`/event/${id}`)}
      style={[styles.container, { borderColor: mode.border, backgroundColor: mode.background }]}
    >
      <Image source={{ uri: photo }} style={styles.image} />

      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: mode.text }]} numberOfLines={1}>
          {headline}
        </Text>

        <Text style={{ color: mode.text }} numberOfLines={1}>
          {place}, {formatDate(date)}
        </Text>

        {description ? (
          <Text style={[styles.desc, { color: mode.text }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    padding: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 6,
  },
  textWrap: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  desc: {
    fontSize: 13,
    marginTop: 4,
  },
});
