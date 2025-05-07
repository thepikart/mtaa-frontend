import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { EventCardProps } from "@/types/models";
import { formatDate } from "@/utils/date";
import { useMode } from "@/hooks/useMode";

export default function EventCardMini({ event }: { event: EventCardProps }) {
  const router = useRouter();
  const mode   = useMode();

  const { id, title, name, place, date, description, photo } = event;

  const headline = title ?? name ?? "Untitled";

  const textColor = mode.text       ?? "#000";
  const cardBg    = mode.background ?? "#FFF";
  const borderCol = mode.border     ?? "#E5E5E5";

  return (
    <Pressable
      onPress={() => router.push(`/event/${id}`)}
      style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}
    >
      <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {headline}
        </Text>

        <Text style={[styles.meta, { color: textColor }]} numberOfLines={1}>
          {place}, {formatDate(date)}
        </Text>

        {description ? (
          <Text style={[styles.desc, { color: textColor }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const CARD_W  = 200;
const IMG_H   = 110;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 14,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: IMG_H,
  },
  body: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    fontWeight: "500",
  },
  desc: {
    fontSize: 12,
    marginTop: 4,
  },
});
