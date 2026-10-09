import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getHistory, clearHistory, HistoryItem } from "../utils/storage";
import classes from "../data/classes.json";

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, []),
  );

  // Stats: count every detected item by class
  const counts: Record<string, number> = {};
  let totalItems = 0;
  history.forEach((h) =>
    h.detections.forEach((d) => {
      counts[d.label] = (counts[d.label] ?? 0) + 1;
      totalItems += 1;
    }),
  );

  function confirmClear() {
    Alert.alert("Clear history?", "This removes all saved scans.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{history.length}</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalItems}</Text>
          <Text style={styles.statLabel}>Items sorted</Text>
        </View>
      </View>

      <View style={styles.chips}>
        {Object.entries(counts).map(([label, n]) => (
          <View
            key={label}
            style={[
              styles.chip,
              { backgroundColor: (classes as any)[label]?.color ?? "#9CA3AF" },
            ]}
          >
            <Text style={styles.chipText}>
              {label} · {n}
            </Text>
          </View>
        ))}
      </View>

      <FlatList
        data={history}
        keyExtractor={(h) => h.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No scans yet. Go scan something!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("Result", { result: item })}
          >
            <Image source={{ uri: item.imageUri }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {item.detections.map((d) => d.label).join(", ") ||
                  "Nothing detected"}
              </Text>
              <Text style={styles.rowSub}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {history.length > 0 && (
        <TouchableOpacity onPress={confirmClear}>
          <Text style={styles.clear}>Clear history</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F8F4", padding: 16 },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  statNum: { fontSize: 28, fontWeight: "800", color: "#14532D" },
  statLabel: { fontSize: 13, color: "#6B7280" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "capitalize",
  },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 32 },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    gap: 12,
    alignItems: "center",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
  rowSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  clear: {
    textAlign: "center",
    color: "#DC2626",
    fontWeight: "600",
    paddingVertical: 12,
  },
});
