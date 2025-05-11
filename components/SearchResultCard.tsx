import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { EventCardProps } from "@/types/models";
import { formatDate } from "@/utils/date";
import { useMode } from "@/hooks/useMode";
import { useState, useEffect } from "react";
import EventService from "@/services/EventService";

export default function SearchResultCard({
  event,
}: {
  event: EventCardProps;
}) {
  const router = useRouter();
  const mode = useMode();
  const { id, title, name, place, date, description } = event;
  const headline = title ?? name ?? "Untitled";

  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (event.photo) {
      setLoading(true);
      EventService.getEventPhoto(id)
        .then((uri) => mounted && setPhotoUri(uri))
        .catch(() => {
          console.warn;
          setPhotoUri(undefined);
    })
        .finally(() => mounted && setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, [event.photo, id]);

  return (
    <Pressable
      onPress={() => router.push(`/event/${id}`)}
      style={[
        styles.container,
        { borderColor: mode.border, backgroundColor: mode.background },
      ]}
    >
      <View style={styles.imageWrapper}>
        {loading ? (
          <ActivityIndicator />
        ) : photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: mode.text }]} numberOfLines={1}>
          {headline}
        </Text>
        <Text style={{ color: mode.text }} numberOfLines={1}>
          {place}, {formatDate(date)}
        </Text>
        {description && (
          <Text style={[styles.desc, { color: mode.text }]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const IMAGE_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    padding: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 6,
    backgroundColor: "#eee",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ccc",
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
