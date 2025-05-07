import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import { useMode } from "@/hooks/useMode";
import { useState, useEffect } from "react";
import EventService from "@/services/EventService";
import SearchResultCard from "@/components/SearchResultCard";

export default function SearchScreen() {
  const mode = useMode();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const data = await EventService.searchEvents(query);
        setResults(data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

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
        onChangeText={setQuery}
      />

      {isLoading && <Text style={{ color: mode.text }}>Loading…</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SearchResultCard event={item} />}
        ListEmptyComponent={
          !isLoading && query.trim() ? (
            <Text style={{ color: mode.text, paddingTop: 20 }}>
              No events found.
            </Text>
          ) : null
        }
      />
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
});