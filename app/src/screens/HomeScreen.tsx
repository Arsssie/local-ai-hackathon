import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getHistory, HistoryItem } from "../utils/storage";

function isToday(ts: number) {
  return new Date(ts).toDateString() === new Date().toDateString();
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, []),
  );

  const today = history.filter((h) => isToday(h.timestamp));
  const itemsToday = today.reduce((sum, h) => sum + h.detections.length, 0);
  const recent = history.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.brand}>GIGO</Text>
      <Text style={styles.tagline}>Garbage In, Garbage Out</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          ● AI runs on this phone · works offline
        </Text>
      </View>

      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate("Scan")}
      >
        <Text style={styles.scanText}>Scan waste</Text>
        <Text style={styles.scanSub}>Know what bin it belongs in</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{today.length}</Text>
          <Text style={styles.statLabel}>Scans today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{itemsToday}</Text>
          <Text style={styles.statLabel}>Items today</Text>
        </View>
      </View>

      <Text style={styles.section}>Recent scans</Text>
      {recent.length === 0 && (
        <Text style={styles.empty}>
          No scans yet. Tap "Scan waste" to start.
        </Text>
      )}
      {recent.map((item) => (
        <TouchableOpacity
          key={item.id}
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
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F8F4" },
  brand: { fontSize: 36, fontWeight: "900", color: "#14532D", marginTop: 24 },
  tagline: { fontSize: 14, color: "#4B5563", marginBottom: 16 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: { color: "#166534", fontWeight: "600", fontSize: 13 },
  scanBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  scanText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  scanSub: { color: "#DCFCE7", fontSize: 14, marginTop: 4 },
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
  section: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14532D",
    marginTop: 24,
    marginBottom: 10,
  },
  empty: { color: "#6B7280" },
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
});
