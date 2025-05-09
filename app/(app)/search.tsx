import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useMode } from "@/hooks/useMode";
import { useState, useEffect } from "react";
import EventService from "@/services/EventService";
import SearchResultCard from "@/components/SearchResultCard";
import { useSystemStore } from "@/stores/systemStore";
import Footer from "@/components/Footer"

const CATEGORIES = ["music", "art", "sports", "technology", "politics", "other"];

export default function SearchScreen() {
  const mode = useMode();
  const connected = useSystemStore((state) => state.connected);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);

  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // whenever query or category changes
  useEffect(() => {
    if (!connected) return;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        let data;
        if (selectedCat) {
          data = await EventService.getEventsByCategory(selectedCat, 20, 0);
        } else if (query.trim()) {
          data = await EventService.searchEvents(query);
        } else {
          data = await EventService.getUpcomingEvents();
        }
        setResults(data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, selectedCat, connected]);

  const onPressCategory = (cat: string) => {
    setSelectedCat(cat === selectedCat ? null : cat);
    setQuery("");
  };

  return (
    <View style={[styles.container, { backgroundColor: mode.background }]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: mode.background,
            color: mode.text,
            borderColor: mode.border,
          },
        ]}
        placeholder="Search events…"
        placeholderTextColor={mode.text + "90"}
        value={query}
        onChangeText={text => {
          setQuery(text);
          setSelectedCat(null);
        }}
      />

      {/*buttons*/ }
      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catButton,
              {
                backgroundColor:
                  selectedCat === cat ? mode.button : mode.headerFooter,
              },
            ]}
            onPress={() => onPressCategory(cat)}
          >
            <Text
              style={[
                styles.catText,
                {
                  color:
                    selectedCat === cat ? "#fff" : mode.text,
                },
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && <Text style={{ color: mode.text }}>Loading…</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SearchResultCard event={item} />}
        ListEmptyComponent={() => {
                   if (isLoading) return null;
                   if (!query.trim()) return null;
                   return (
                    <Text style={{ color: mode.text, paddingTop: 20 }}>
                       No events found.
                     </Text>
                   );
                 }}
      />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  catButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  catText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
