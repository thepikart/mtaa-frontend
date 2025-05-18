// searchtablet.tsx

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
 * SearchTabletScreen
 *
 * Tablet-optimized search screen.
 * - Displays two columns of search results.
 * - Includes category filters, text search, and debouncing.
 * - Logs analytics events for search actions.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function SearchTabletScreen(): JSX.Element {
  const mode = useMode();
  const connected = useSystemStore((s) => s.connected);

  // Number of columns for tablet layout
  const numCols = 2;

  const [query, setQuery] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * loadData
   *
   * Unified fetch helper:
   * - Loads events by category if selected.
   * - Loads search results for non-empty query.
   * - Otherwise retrieves upcoming events.
   * Logs analytics and handles errors.
   *
   * @async
   * @param {string} q — the search query
   * @param {(string|null)} cat — selected category or null
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

  // Initial load on component mount
  useEffect(() => {
    loadData("", null);
  }, [loadData]);

  // Debounce search and category changes
  useEffect(() => {
    const timeout = setTimeout(() => loadData(query, selectedCat), 400);
    return () => clearTimeout(timeout);
  }, [query, selectedCat, loadData]);

  /**
   * onPressCategory
   *
   * Toggles the selected category filter and clears the text query.
   *
   * @param {string} cat — the category to toggle
   */
  const onPressCategory = (cat: string): void => {
    setSelectedCat(cat === selectedCat ? null : cat);
    setQuery("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: mode.background }}>
      <View style={styles.container}>
        {/* Search input */}
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
          onChangeText={(text) => {
            setQuery(text);
            setSelectedCat(null);
          }}
        />

        {/* Category filters */}
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catButton,
                { backgroundColor: selectedCat === cat ? mode.button : mode.headerFooter },
              ]}
              onPress={() => onPressCategory(cat)}
            >
              <Text style={[styles.catText, { color: selectedCat === cat ? "#fff" : mode.text }]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading indicator */}
        {loading && <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={mode.text} />}

        {/* Results grid */}
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={numCols}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <View style={{ width: "48%" }}>
              <SearchResultCard event={item} />
            </View>
          )}
          ListEmptyComponent={() => {
            if (loading) return null;
            if (!query.trim() && !selectedCat) return null;
            return <Text style={{ color: mode.text, paddingTop: 20 }}>No events found.</Text>;
          }}
        />
      </View>
      <Footer />
    </View>
  );
}

/**
 * Styles for SearchTabletScreen
 *
 * - `container`: wrapper with padding
 * - `input`: search TextInput style
 * - `categories`, `catButton`, `catText`: category pill styling
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
