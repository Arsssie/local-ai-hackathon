import { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  ChevronRight,
  History,
  Leaf,
  Recycle,
  ScanLine,
  Trash2,
} from "lucide-react-native";
import { getHistory, clearHistory, HistoryItem } from "../utils/storage";
import { isUnsure } from "../ml/confidence";
import classes from "../data/classes.json";
import AppHeader from "../components/AppHeader";

const DARK_GREEN = "#1B6045";
const LIGHT_GREEN = "#76C255";

function dayLabel(ts: number) {
  const d = new Date(ts).toDateString();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d === today.toDateString()) return "Today";
  if (d === yesterday.toDateString()) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDay(history: HistoryItem[]) {
  const sections: { title: string; data: HistoryItem[] }[] = [];
  history.forEach((item) => {
    const title = dayLabel(item.timestamp);
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.data.push(item);
    else sections.push({ title, data: [item] });
  });
  return sections;
}

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, []),
  );

  // Stats: count every detected item by class
  const counts: Record<string, number> = {};
  let totalItems = 0;
  history.forEach((h) =>
    h.detections
      .filter((d) => !isUnsure(d))
      .forEach((d) => {
        counts[d.label] = (counts[d.label] ?? 0) + 1;
        totalItems += 1;
      }),
  );
  const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

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

  const header = (
    <>
      <Text style={styles.subtitle}>Everything you've scanned so far</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <ScanLine size={20} color={DARK_GREEN} />
          </View>
          <Text style={styles.statNum}>{history.length}</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <Recycle size={20} color={DARK_GREEN} />
          </View>
          <Text style={styles.statNum}>{totalItems}</Text>
          <Text style={styles.statLabel}>Items sorted</Text>
        </View>
      </View>

      {sortedCounts.length > 0 && (
        <>
          <Text style={styles.section}>Items by type</Text>
          <View style={styles.chips}>
            {sortedCounts.map(([label, n]) => (
              <View key={label} style={styles.chip}>
                <View
                  style={[
                    styles.chipDot,
                    {
                      backgroundColor:
                        (classes as any)[label]?.color ?? "#9CA3AF",
                    },
                  ]}
                />
                <Text style={styles.chipText}>{label}</Text>
                <Text style={styles.chipCount}>{n}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        showMenu={false}
        title={
          <View style={styles.titleRow}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ChevronLeft size={24} color={DARK_GREEN} />
              </TouchableOpacity>
            )}
            <History size={20} color={DARK_GREEN} />
            <Text style={styles.title}>History</Text>
          </View>
        }
      />

      <SectionList
        sections={groupByDay(history)}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Leaf size={26} color={LIGHT_GREEN} />
            </View>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.empty}>Go scan something!</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate("Tabs", { screen: "Scan" })}
              activeOpacity={0.85}
            >
              <ScanLine size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Start scanning</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const sure = item.detections.filter((d) => !isUnsure(d)).length;
          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Result", { result: item })}
            >
              <Image source={{ uri: item.imageUri }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.detections.map((d) => d.label).join(", ") ||
                    "Nothing detected"}
                </Text>
                <Text style={styles.rowSub}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {sure} {sure === 1 ? "item" : "items"}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          history.length > 0 ? (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={confirmClear}
              activeOpacity={0.85}
            >
              <Trash2 size={16} color="#DC2626" />
              <Text style={styles.clearText}>Clear history</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingBottom: 40 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "800", color: DARK_GREEN },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },

  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "#F3F8F4",
    borderRadius: 18,
    padding: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statNum: { fontSize: 28, fontWeight: "800", color: DARK_GREEN },
  statLabel: { fontSize: 13, color: "#6B7280" },

  section: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_GREEN,
    marginTop: 24,
    marginBottom: 12,
  },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F8F4",
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "capitalize",
  },
  chipCount: {
    minWidth: 22,
    textAlign: "center",
    backgroundColor: "#fff",
    color: DARK_GREEN,
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#F3F8F4",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    gap: 12,
    alignItems: "center",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
  rowSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  emptyCard: {
    backgroundColor: "#F3F8F4",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginTop: 24,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  empty: { color: "#6B7280", marginTop: 2 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: DARK_GREEN,
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 20,
    marginTop: 16,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    marginTop: 16,
  },
  clearText: { color: "#DC2626", fontWeight: "600", fontSize: 15 },
});
