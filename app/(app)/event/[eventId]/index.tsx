import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Pressable,
  InteractionManager,
} from "react-native";
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { useMode } from "@/hooks/useMode";
import { useUserStore } from "@/stores/userStore";
import { useEventStore } from "@/stores/eventStore";
import EventService from "@/services/EventService";
import { Event, Comment, Attendee } from "@/types/models";
import { formatDate } from "@/utils/date";
import Footer from "@/components/Footer";
import Feather from "@expo/vector-icons/Feather";
import AntIcon from "@expo/vector-icons/AntDesign";
import { useConfirmation } from "@/hooks/useConfirm";
import { useSystemStore } from "@/stores/systemStore";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL!;
const WS_URL   = BASE_URL.replace(/^http/, "ws");

export default function EventScreen() {
  const connected = useSystemStore((state) => state.connected);
  const ws = useRef<WebSocket>();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const mode = useMode();
  const me = useUserStore((s) => s.user);
  const { confirm, Confirmation } = useConfirmation();

  const [event, setEvent]         = useState<Event | null>(null);
  const [photoUri, setPhotoUri]   = useState<string | undefined>();
  const [comments, setComments]   = useState<Comment[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [registered, setRegistered] = useState(false);
  const [showAtt,   setShowAtt]   = useState(false);

  const [newComment,   setNewComment]   = useState("");
  const [isLoading,    setIsLoading]    = useState(true);
  const [isRegistering,setIsRegistering]= useState(false);


  const pushUniqueComment = (comm: Comment) =>
    setComments(prev => (prev.some(c => c.id === comm.id) ? prev : [comm, ...prev]));

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadEvent = async () => {
        setIsLoading(true);
        try {
          const evtResp = await useEventStore.getState().getEventById(+eventId);
          if (!evtResp.success || !evtResp.data) throw new Error(evtResp.message);
          const evt = evtResp.data;

          const [commentsArr, attendeesData, base64Photo] = await Promise.all([
            EventService.getComments(+eventId),
            EventService.getAttendees(+eventId),
            evt.photo ? EventService.getEventPhoto(evt.id) : Promise.resolve(undefined),
          ]);

          if (!mounted) return;

          setEvent(evt);
          setPhotoUri(base64Photo);
          setComments(commentsArr);

          const atts: Attendee[] = Array.isArray(attendeesData)
            ? attendeesData
            : attendeesData.attendees ?? [];
          setAttendees(atts);

          setRegistered(atts.some(a => a.userId === me!.id));
        } catch {
          Alert.alert("Error", "Failed to load event.");
        } finally {
          setIsLoading(false);
        }
      };

      loadEvent();
      return () => { mounted = false };
    }, [eventId])
  );


  useEffect(() => {
    if (!event) return;

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => console.log("🟢 WS opened");

    ws.current.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data);

        if (msg.type === "newComment" && msg.data.event_id === +eventId) {
          pushUniqueComment(msg.data);
        }
        if (msg.type === "deletedComment" && msg.data.event_id === +eventId) {
          setComments(prev => prev.filter(c => c.id !== msg.data.comment_id));
        }
      } catch {}
    };

    ws.current.onerror = e => console.warn("🔴 WS error", e);
    return () => ws.current?.close();
  }, [eventId, event]);


  const handleRegister = () => {
    if (!event || isRegistering) return;
    setIsRegistering(true);

    InteractionManager.runAfterInteractions(async () => {
      try {
        if (registered) {
          const ok = await confirm("Naozaj sa chceš odregistrovať?");
          if (!ok) return;
          await useEventStore.getState().cancelEventRegistration(event.id);
          setRegistered(false);
          setAttendees(prev => prev.filter(a => a.userId !== me!.id));
          Alert.alert("Úspech", "Boli ste odregistrovaný.");
          return;
        }

        if (event.price > 0) {
          const ok = await confirm(`Táto udalosť stojí $${event.price}. Pokračovať k platbe?`);
          if (!ok) return;
          useEventStore.getState().setEventToPay(event);
          router.push(`/event/${event.id}/pay`);
          return;
        }

        const resp = await useEventStore.getState().registerForEvent(event.id);
        if (!resp.success) throw new Error(resp.message);
        setRegistered(true);
        setAttendees(prev => [{ userId: me!.id, username: me!.username }, ...prev]);
        Alert.alert("Úspech", "Úspešne si sa registroval/-a.");
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Registrácia zlyhala.");
      } finally {
        setIsRegistering(false);
      }
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (connected) {
      const result = await useEventStore.getState().createComment(+eventId, newComment.trim());
      if (result.success) {
        console.log("Comment added:", result.data);
        setComments((prev) => [result.data, ...prev]);
        setNewComment("");
      }
      else {
        Alert.alert("Error", result.message);
      }
    }
    else {
      await useSystemStore.getState().addToOfflineQueue("createComment", { eventId, data: newComment });
      Alert.alert("Offline mode", "Comment will be added when you are back online.");
      router.back();
    }
  }


  const handleDeleteComment = async (id: number) => {
    try {
      await EventService.deleteComment(+eventId, id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      Alert.alert("Error", "Cannot delete comment");
    }
  };

  /*───────────────────────────
   * UI
   *───────────────────────────*/
  if (isLoading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={mode.text} />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: mode.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: "#ddd" }]} />
        )}

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: mode.text }]}>{event.name}</Text>
            <Text style={{ color: mode.text }}>
              {event.place}, {formatDate(event.date)}
            </Text>
            {event.creator && (
              <View style={styles.authorRow}>
                <Image source={{ uri: event.creator.photo }} style={styles.avatar} />
                <Text style={{ color: mode.text }}>{event.creator.name}</Text>
              </View>
            )}
          </View>

          {/* PAY / REGISTER BUTTON */}
          <Pressable
            onPress={handleRegister}
            disabled={isRegistering}
            style={[styles.regBtn, registered && styles.regBtnRegistered]}
          >
            {isRegistering ? (
              <ActivityIndicator size={18} color="#fff" />
            ) : registered ? (
              <Feather name="user-minus" size={22} color="#fff" />
            ) : (
              <Feather
                name={event.price > 0 ? "credit-card" : "user-plus"}
                size={22}
                color="#fff"
              />
            )}
          </Pressable>
        </View>

        {!!event.description && (
          <Text style={[styles.desc, { color: mode.text }]}>{event.description}</Text>
        )}

        {/* Attendees */}
        <Pressable onPress={() => setShowAtt(s => !s)} style={{ marginTop: 16 }}>
          <Text style={[styles.section, { color: mode.blueText }]}>
            {showAtt ? "Hide attendees" : `Show attendees (${attendees.length})`}
          </Text>
        </Pressable>
        {showAtt &&
          (attendees.length ? (
            attendees.map(a => (
              <Text key={a.userId} style={{ color: mode.text }}>
                • {a.username}
              </Text>
            ))
          ) : (
            <Text style={{ color: mode.text }}>No attendees yet.</Text>
          ))}

        {/* COMMENTS */}
        <Text style={[styles.section, { marginTop: 24, color: mode.text }]}>Comments</Text>
        <View style={styles.commentRow}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add comment…"
            placeholderTextColor={mode.textPlaceholder}
            style={[styles.input, { borderColor: mode.border, color: mode.text }]}
          />
          <Pressable
            onPress={handleAddComment}
            disabled={!newComment.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: newComment.trim() ? mode.button : mode.disabledButton },
            ]}
          >
            <Feather name="send" size={18} color="#fff" />
          </Pressable>
        </View>
        {comments.map(c => (
          <View key={c.id} style={styles.commentItem}>
            <Text style={[styles.commentAuthor, { color: mode.text }]}>{c.User.username}</Text>
            <View style={styles.commentContentRow}>
              <Text style={{ color: mode.text, flex: 1 }}>{c.content}</Text>
              {c.User.id === me?.id && (
                <Pressable onPress={() => handleDeleteComment(c.id)}>
                  <AntIcon name="delete" size={18} color={mode.text} />
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Footer />
      <Confirmation />
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16 },
  image: { width: "100%", height: 220, borderRadius: 8, marginBottom: 12 },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14 },

  regBtn: { backgroundColor: "#0078FF", padding: 10, borderRadius: 8 },
  regBtnRegistered: { backgroundColor: "#28a745" },

  title: { fontSize: 22, fontWeight: "700" },
  desc: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: "600" },

  commentRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  sendBtn: { padding: 8, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  commentItem: { marginTop: 12 },
  commentAuthor: { fontWeight: "600", marginBottom: 2 },
  commentContentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
});
