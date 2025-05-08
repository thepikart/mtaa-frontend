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
  import { useRouter, useLocalSearchParams } from "expo-router";
  import { useEffect, useState } from "react";
  import { useMode } from "@/hooks/useMode";
  import { useUserStore } from "@/stores/userStore";
  import { useEventStore } from "@/stores/eventStore";
  import EventService from "@/services/EventService";
  import { Event, Comment, Attendee } from "@/types/models";
  import { formatDate } from "@/utils/date";
  import Footer from "@/components/Footer";
  import Feather from "@expo/vector-icons/Feather";
  import AntIcon from "@expo/vector-icons/AntDesign";
  import { useRef } from 'react';

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL!;
  const WS_URL = BASE_URL.replace(/^http/, 'ws');

  export default function EventScreen() {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const router = useRouter();
    const mode = useMode();
    const me = useUserStore((s) => s.user);
  
    const [event, setEvent] = useState<Event | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [showAtt, setShowAtt] = useState(false);
  
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);

    const ws = useRef<WebSocket>();

  
    useEffect(() => {
      let mounted = true;
      const loadAll = async () => {
        try {
          const evtResp = await useEventStore
            .getState()
            .getEventById(Number(eventId));
  
          if (!evtResp.success || !evtResp.data) {
            throw new Error(evtResp.message || "Event not found");
          }
          const evt = evtResp.data;
  
          const [commentsArr, attResp] = await Promise.all([
            EventService.getComments(+eventId),
            EventService.getAttendees(+eventId),
          ]);
  
          if (!mounted) return;
          setEvent(evt);
          setComments(commentsArr);
          setAttendees(attResp?.attendees ?? []);
        } catch (e) {
          Alert.alert("Error", "Failed to load event.");
        } finally {
          mounted = false;
          setIsLoading(false);
        }
      };
      loadAll();
      return () => {
        mounted = false;
      };
    }, [eventId]);

    useEffect(() => {
      const ws = new WebSocket(
        // predpokladáme, že WS_URL je tvoja ws:// adresa
        `${BASE_URL.replace(/^http/, "ws")}`
      );
    
      ws.onopen = () => console.log("🟢 WS connected");
      ws.onmessage = ({ data }) => {
        const msg = JSON.parse(data);
        if (msg.type === "newComment" && msg.data.event_id === +eventId) {
          setComments(prev => [msg.data, ...prev]);
        }
        if (msg.type === "deletedComment" && msg.data.event_id === +eventId) {
          setComments(prev => prev.filter(c => c.id !== msg.data.comment_id));
        }
      };
      ws.onerror = e => console.warn("🔴 WS error");
    
      return () => {
        ws.close();
      };
    }, [eventId]);
  

    const handleRegister = () => {
      if (!event || isRegistering || registered) return;
  
      setIsRegistering(true);
  
      InteractionManager.runAfterInteractions(async () => {
        try {
          if (event.price > 0) {
            useEventStore.getState().setEventToPay(event);
            router.push(`/event/${event.id}/pay`);
          } else {
            const resp = await useEventStore
              .getState()
              .registerForEvent(event.id);
            if (!resp.success) throw new Error(resp.message);
            setRegistered(true);
            Alert.alert("Success", "Úspešne si sa registroval/-a.");
          }
        } catch (err: any) {
          Alert.alert("Error", err?.message || "Registrácia zlyhala.");
        } finally {
          setIsRegistering(false);
        }
      });
    };
  
    const handleAddComment = async () => {
      if (!newComment.trim()) return;
      try {
        await EventService.createComment(+eventId, newComment.trim());
        setNewComment("");
      } catch (err: any) {
        Alert.alert("Error", err?.response?.data?.message || "Add comment failed");
      }
    };
  
    const handleDeleteComment = async (id: number) => {
      try {
        await EventService.deleteComment(+eventId, id);
        setComments((prev) => prev.filter((c) => c.id !== id));
      } catch (err: any) {
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Cannot delete comment"
        );
      }
    };
  
    if (isLoading || !event) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={mode.text} />
        </View>
      );
    }
  
    const imageUri = event.photo
    ? event.photo.startsWith("http")
      ? event.photo
      : `${BASE_URL.replace(/\/$/, "")}/${event.photo.replace(/^\/?/, "")}`
    : undefined;
  
    const creator = event.creator;
  
    return (
      <View style={[styles.wrapper, { backgroundColor: mode.background }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: "#ddd" }]} />
          )}
  
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: mode.text }]}>
                {event.name}
              </Text>
              <Text style={{ color: mode.text }}>
                {event.place}, {formatDate(event.date)}
              </Text>
  
              {/* Author */}
              {creator && (
                <View style={styles.authorRow}>
                  <Image
                    source={{ uri: creator.photo }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                  <Text style={{ color: mode.text }}>{creator.name}</Text>
                </View>
              )}
            </View>
  
            {/*PAY*/}
            <Pressable
              onPress={handleRegister}
              disabled={isRegistering || registered}
              style={styles.regBtn}
            >
              {isRegistering ? (
                <ActivityIndicator size={18} color="#fff" />
              ) : registered ? (
                <Feather name="check" size={22} color="#fff" />
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
            <Text style={[styles.desc, { color: mode.text }]}>
              {event.description}
            </Text>
          )}
  
          {/* Attendees */}
          <Pressable onPress={() => setShowAtt((s) => !s)} style={{ marginTop: 16 }}>
            <Text style={[styles.section, { color: mode.blueText }]}>
              {showAtt
                ? "Hide attendees"
                : `Show attendees (${attendees.length})`}
            </Text>
          </Pressable>
  
          {showAtt &&
            (attendees.length ? (
              attendees.map((a) => (
                <Text key={a.userId} style={{ color: mode.text }}>
                  • {a.username}
                </Text>
              ))
            ) : (
              <Text style={{ color: mode.text }}>No attendees yet.</Text>
            ))}
  
          {/* COMMENTS */}
          <Text style={[styles.section, { marginTop: 24, color: mode.text }]}>
            Comments
          </Text>
  
          {/* Add comment */}
          <View style={styles.commentRow}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add comment…"
              placeholderTextColor={mode.textPlaceholder}
              style={[
                styles.input,
                { borderColor: mode.border, color: mode.text },
              ]}
            />
            <Pressable
              onPress={handleAddComment}
              disabled={!newComment.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: newComment.trim()
                    ? mode.button
                    : mode.disabledButton,
                },
              ]}
            >
              <Feather name="send" size={18} color="#fff" />
            </Pressable>
          </View>
  
          {comments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Text style={[styles.commentAuthor, { color: mode.text }]}>
                {c.User.username}
              </Text>
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
    title: { fontSize: 22, fontWeight: "700" },
    desc: { marginTop: 8, fontSize: 14, lineHeight: 20 },
    section: { fontSize: 16, fontWeight: "600" },
  
 //komenty
    commentRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 6,
    },
    sendBtn: {
      padding: 8,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    commentItem: { marginTop: 12 },
    commentAuthor: { fontWeight: "600", marginBottom: 2 },
    commentContentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  });
  