// searchphone.tsx

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useMode } from "@/hooks/useMode";
import { useState, useEffect, useCallback } from "react";
import EventService from "@/services/EventService";
import SearchResultCard from "@/components/SearchResultCard";
import Footer from "@/components/Footer";
import { useSystemStore } from "@/stores/systemStore";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";

const CATEGORIES = [
  "music",
  "art",
  "sports",
  "technology",
  "politics",
  "other",
];

/**
 * SearchPhoneScreen
 *
 * Mobile-optimized search screen.
 * - Shows a text input and category pills.
 * - Logs analytics events for category and free-text searches.
 * - Falls back to upcoming events when empty.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function SearchPhoneScreen(): JSX.Element {
  const mode = useMode();
  const connected = useSystemStore((s) => s.connected);
  const numCols = 1;

  const [query, setQuery] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * loadData
   *
   * Fetches search results based on a query or category,
   * or upcoming events if both are empty. Logs analytics.
   *
   * @async
   * @function loadData
   * @param {string} q — the free-text query
   * @param {string|null} cat — the selected category, or null
   * @returns {Promise<void>}
   */
  const loadData = useCallback(
    async (q: string, cat: string | null): Promise<void> => {
      if (!connected) return;

      setLoading(true);
      try {
        let data;
        if (cat) {
          data = await EventService.getEventsByCategory(cat, 20);
          analytics().logEvent("search_category", { category: cat });
        } else if (q.trim()) {
          data = await EventService.searchEvents(q);
          analytics().logSearch({ search_term: q });
        } else {
          data = await EventService.getUpcomingEvents();
        }
        setResults(data);
      } catch (err) {
        crashlytics().log("Search error");
        crashlytics().recordError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [connected]
  );

  // Initial load on mount
  useEffect(() => {
    loadData("", null);
  }, [loadData]);

  // Debounced reload on query or category change
  useEffect(() => {
    const t = setTimeout(() => loadData(query, selectedCat), 400);
    return () => clearTimeout(t);
  }, [query, selectedCat, loadData]);

  /**
   * onPressCategory
   *
   * Toggles the selected category filter and clears query.
   *
   * @param {string} cat — the category that was tapped
   * @returns {void}
   */
  const onPressCategory = (cat: string): void => {
    setSelectedCat(cat === selectedCat ? null : cat);
    setQuery("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: mode.background }}>
      <View style={styles.container}>
        {/* search box */}
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
          onChangeText={(txt) => {
            setQuery(txt);
            setSelectedCat(null);
          }}
        />

        {/* categories */}
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
                  { color: selectedCat === cat ? "#fff" : mode.text },
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <ActivityIndicator
            style={{ marginVertical: 20 }}
            size="large"
            color={mode.text}
          />
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={numCols}
          renderItem={({ item }) => <SearchResultCard event={item} />}
          ListEmptyComponent={() => {
            if (loading) return null;
            if (!query.trim() && !selectedCat) return null;
            return (
              <Text style={{ color: mode.text, paddingTop: 20 }}>
                No events found.
              </Text>
            );
          }}
        />
      </View>
      <Footer />
    </View>
  );
}

/**
 * Styles for SearchPhoneScreen
 *
 * - `container` wraps the search UI
 * - `input` styles the TextInput
 * - `categories`, `catButton`, `catText` style the filter pills
 */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
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
  catText: { fontSize: 14, fontWeight: "500" },
});
