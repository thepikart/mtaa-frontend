import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useMode } from "@/hooks/useMode";
import { useState, useEffect, useCallback } from "react";
import EventService from "@/services/EventService";
import SearchResultCard from "@/components/SearchResultCard";
import Footer from "@/components/Footer";
import { useSystemStore } from "@/stores/systemStore";
import * as Device from "expo-device";;
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

const CATEGORIES = ["music", "art", "sports", "technology", "politics", "other"];

export default function SearchScreen() {
  const mode = useMode();
  const connected = useSystemStore((s) => s.connected);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const numCols = isTablet ? 2 : 1;

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /** ---------- unified fetch helper ---------- */
  const loadData = useCallback(async (q: string, cat: string | null) => {
    if (!connected) return;

    setLoading(true);
    try {
      let data;
      if (cat) {
        data = await EventService.getEventsByCategory(cat, 20);
        analytics().logEvent('search_category', { category: selectedCat });
      }
      else if (q.trim()) {
        data = await EventService.searchEvents(q);
        analytics().logSearch({ search_term: query });
      }
      else {
        data = await EventService.getUpcomingEvents();
      }
      setResults(data);
    }
    catch (err) {
      crashlytics().log('Search error');
      crashlytics().recordError(err as Error);
    }
    finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => { loadData("", null); }, [loadData]);


  useEffect(() => {
    const t = setTimeout(() => loadData(query, selectedCat), 400);
    return () => clearTimeout(t);
  }, [query, selectedCat, loadData]);


  const onPressCategory = (cat: string) => {
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
            { backgroundColor: mode.background, color: mode.text, borderColor: mode.border },
          ]}
          placeholder="Search events…"
          placeholderTextColor={mode.text + "90"}
          value={query}
          onChangeText={(txt) => { setQuery(txt); setSelectedCat(null); }}
        />

        {/* categories */}
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

        {loading && (
          <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={mode.text} />
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={numCols}
          columnWrapperStyle={
            numCols > 1 && results.length ? { justifyContent: "space-between" } : undefined
          }
          renderItem={({ item }) => (
            <View style={numCols > 1 && { width: "48%" }}>
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

/* ---------- styles ---------- */
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
