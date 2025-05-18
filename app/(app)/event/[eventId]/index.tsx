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
import analytics from '@react-native-firebase/analytics';
import ProfilePhoto from "@/components/ProfilePhoto";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL!;
const WS_URL = BASE_URL.replace(/^http/, "ws");


/**
 * EventScreen
 *
 * Displays the details of a single event, including:
 * - Event photo and metadata
 * - Register/unregister flow with confirmation dialogs
 * - Real-time comments via WebSocket
 * - Adding and deleting comments (with offline queue support)
 * - Attendees list toggle
 *
 * @component
 * @returns {JSX.Element}
 */
export default function EventScreen(): JSX.Element {
  const connected = useSystemStore((state) => state.connected);
  const ws = useRef<WebSocket>();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const mode = useMode();
  const me = useUserStore((s) => s.user);
  const { confirm, Confirmation } = useConfirmation();

  const [event, setEvent] = useState<Event | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [registered, setRegistered] = useState(false);
  const [showAtt, setShowAtt] = useState(false);
  const [creatorPhoto, setCreatorPhoto] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);


  /**
 * pushUniqueComment
 *
 * Inserts a new comment at the top of the list only if it doesn’t already exist.
 *
 * @param {Comment} comm — the incoming comment object
 * @returns {void}
 */
const pushUniqueComment = (comm: Comment): void => {
    setComments(prev => (prev.some(c => c.id === comm.id) ? prev : [comm, ...prev]));
  }

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadEvent = async () => {
        setIsLoading(true);
        try {
          const evtResp = await useEventStore.getState().getEventById(+eventId);
          const response = await useUserStore.getState().getPhoto(evtResp.data.creator.id);
          if (response.success && response.data) {
            setCreatorPhoto(response.data);
          }
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

          for (const c of commentsArr) {
            if (c.User.photo) {
              const response = await useUserStore.getState().getPhoto(c.User.id);
              if (response.success && response.data) {
                c.User.photo = response.data;
              }
              else {
                c.User.photo = null;
              }
            }
          }

          const atts: Attendee[] = Array.isArray(attendeesData)
            ? attendeesData
            : attendeesData.attendees ?? [];
          setAttendees(atts);

          for (const a of atts) {
            if (a.photo) {
              const response = await useUserStore.getState().getPhoto(a.userId);
              if (response.success && response.data) {
                a.photo = response.data;
              }
              else {
                a.photo = null;
              }
            }
          }

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
          msg.data.User.photo = null;
          pushUniqueComment(msg.data);
        }
        if (msg.type === "deletedComment" && msg.data.event_id === +eventId) {
          setComments(prev => prev.filter(c => c.id !== msg.data.comment_id));
        }
      } catch { }
    };

    ws.current.onerror = e => console.warn("🔴 WS error", e);
    return () => ws.current?.close();
  }, [eventId, event]);

/**
 * handleRegister
 *
 * Handles registering or unregistering for the event.
 * - Prompts for confirmation
 * - Calls the appropriate store action
 * - Logs analytics
 * - Shows success or error alerts
 *
 * @returns {void}
 */
const handleRegister = (): void => {
    if (!event || isRegistering) return;
    setIsRegistering(true);

    InteractionManager.runAfterInteractions(async () => {
      try {
        if (registered) {
          const ok = await confirm("Do you want to cancel your registration?");
          if (!ok) return;
          await useEventStore.getState().cancelEventRegistration(event.id);
          analytics().logEvent("event_unregistered", {
            eventId: event.id,
            eventPrice: event.price,
            eventCategory: event.category,
          });
          setRegistered(false);
          setAttendees(prev => prev.filter(a => a.userId !== me!.id));
          if (event.price > 0) {
            Alert.alert("Success", "You have successfully canceled your registration. A refund will be processed shortly.");
          }
          else {
            Alert.alert("Success", "You have successfully canceled your registration.");
          }
          return;
        }

        if (event.price > 0) {
          const ok = await confirm(`This event costs ${event.price}€. Do you want to proceed to checkout?`);
          analytics().logEvent("event_payment_started", {
            eventId: event.id,
            eventPrice: event.price,
            eventCategory: event.category,
          });
          if (!ok) return;
          useEventStore.getState().setEventToPay(event);
          router.push(`/event/${event.id}/pay`);
          return;
        }

        const resp = await useEventStore.getState().registerForEvent(event.id);
        if (!resp.success) throw new Error(resp.message);
        analytics().logEvent("event_registered", {
          eventId: event.id,
          eventPrice: event.price,
          eventCategory: event.category,
        });
        setRegistered(true);
        setAttendees(prev => [{ userId: me!.id, username: me!.username, name: me!.name, surname: me!.surname }, ...prev]);
        Alert.alert("Success", "You have successfully registered for the event.");
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Registration failed.");
      } finally {
        setIsRegistering(false);
      }
    });
  };
/**
 * handleAddComment
 *
 * Adds a new comment:
 * - If online, calls the API and pushes comment via WebSocket
 * - If offline, enqueues to offline queue
 *
 * @async
 * @returns {Promise<void>}
 */
const handleAddComment = async (): Promise<void> => {
    if (!newComment.trim()) return;
    if (connected) {
      const result = await useEventStore.getState().createComment(+eventId, newComment.trim());
      if (result.success) {
        analytics().logEvent("event_comment_added", {
          eventId: eventId,
          eventCategory: event?.category,
        });

        pushUniqueComment(result.data);
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

/**
 * handleDeleteComment
 *
 * Deletes an existing comment via the API and removes it from state.
 *
 * @param {number} id — the ID of the comment to delete
 * @async
 * @returns {Promise<void>}
 */
const handleDeleteComment = async (id: number): Promise<void> => {
    try {
      await EventService.deleteComment(+eventId, id);
      analytics().logEvent("event_comment_deleted", {
        eventId: eventId,
        eventCategory: event?.category,
      });
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
              <View style={styles.authorRow} >
                <ProfilePhoto
                  size={28}
                  borderRadius={14}
                  fontSize={12}
                  id={event.creator.id}
                  name={event.creator.name}
                  surname={event.creator.surname}
                  photo={creatorPhoto ? creatorPhoto : null}
                />
                <Text style={{ color: mode.text }} onPress={() => {
                  router.push(`/profile/${event.creator?.id}`);
                }}>{event.creator.username}</Text>
              </View>
            )}
          </View>

          {/* PAY / REGISTER BUTTON */}
          {event.creator?.id !== me?.id ? (
            <Pressable
              onPress={handleRegister}
              disabled={isRegistering}
              style={[styles.regBtn, registered && styles.regBtnRegistered]}
            >
              {isRegistering ? (
                <ActivityIndicator size={18} color="#fff" />
              ) : registered ? (
                <Feather name="user-check" size={22} color="#fff" />
              ) : (
                <Feather
                  name={event.price > 0 ? "credit-card" : "user-plus"}
                  size={22}
                  color="#fff"
                />
              )}
            </Pressable>
          ) : (
            <Pressable style={styles.editButton} onPress={() => router.push(`/event/${event.id}/edit`)} >
              <Feather name="edit" size={28} />
            </Pressable>)
          }
        </View>

        {!!event.description && (
          <>
            <Text style={[styles.price, { color: mode.text }]}>Price: {event.price}€</Text>            
            <Text style={[styles.desc, { color: mode.text }]}>{event.description}</Text>
            <Text style={[styles.desc, { color: mode.text }]}>Category: {event.category}</Text>
          </>
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
              <View key={a.userId} style={styles.attendeeRow}>
                <ProfilePhoto
                  size={28}
                  borderRadius={14}
                  fontSize={12}
                  id={a.userId}
                  name={a.name}
                  surname={a.surname}
                  photo={a.photo ? a.photo : null}
                />
                <Text style={{ color: mode.text }} onPress={() => {
                  router.push(`/profile/${a.userId}`);
                }} >{a.username}</Text>
              </View>
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
            <View style={styles.photoRow}>
              <ProfilePhoto
                size={28}
                borderRadius={14}
                fontSize={12}
                id={c.User.id}
                name={c.User.name}
                surname={c.User.surname}
                photo={c.User.photo ? c.User.photo : null}
              />
              <Text style={[styles.commentAuthor, { color: mode.text }]} onPress={() => {
                router.push(`/profile/${c.User.id}`);
              }}>{c.User.username}</Text>
            </View>
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
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 7,
  },
  price: {
    marginTop: 15,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#E3E3E3",
    padding: 8,
    borderRadius: 8,
  }
});
