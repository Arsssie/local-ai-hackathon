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
import {
  Camera,
  ScanLine,
  Recycle,
  ChevronRight,
  WifiOff,
  Leaf,
  Trash2,
  AlertTriangle,
} from "lucide-react-native";
import { getHistory, HistoryItem } from "../utils/storage";
import { isUnsure } from "../ml/confidence";
import logo from "../../assets/Gigo.png";
import AppHeader from "../components/AppHeader";

const DARK_GREEN = "#1B6045";
const LIGHT_GREEN = "#76C255";

//changes to be followed here
const CATEGORIES = [
  {
    title: "Biodegradable",
    sub: "Food scraps, leaves",
    Icon: Leaf,
    bg: "#EFF6E6",
    fg: "#2F5D2A",
  },
  {
    title: "Recyclable",
    sub: "Paper, clean bottles",
    Icon: Recycle,
    bg: "#E7F1FD",
    fg: "#1E4E8C",
  },
  {
    title: "Residual",
    sub: "Non-recyclable waste",
    Icon: Trash2,
    bg: "#EFEFEF",
    fg: "#111827",
  },
  {
    title: "Special Waste",
    sub: "Batteries, e-waste",
    Icon: AlertTriangle,
    bg: "#FCEBE6",
    fg: "#8B2E1F",
  },
];

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
  const itemsToday = today.reduce(
    (sum, h) => sum + h.detections.filter((d) => !isUnsure(d)).length,
    0,
  );
  const recent = history.slice(0, 3);

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.hello}>Hello Eco Buddy!</Text>
        <Text style={styles.helloSub}>
          Ready to make a little less waste today?
        </Text>

      

        {/* Hero scan card */}
        <TouchableOpacity
          style={styles.hero}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Scan", { autoStart: true })}
        >
          <Image
            source={logo}
            style={styles.heroWatermark}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Scan waste</Text>
          <Text style={styles.heroSub}>Know what bin it belongs in</Text>
          <View style={styles.heroBtn}>
            <Camera size={18} color={DARK_GREEN} />
            <Text style={styles.heroBtnText}>Start scanning</Text>
          </View>
        </TouchableOpacity>

        {/* Explore waste categories */}
        <Text style={styles.categoriesTitle}>Explore Waste Categories</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(({ title, sub, Icon, bg, fg }) => (
            <View key={title} style={[styles.categoryCard, { backgroundColor: bg }]}>
              <Icon size={20} color={fg} />
              <Text style={[styles.categoryTitle, { color: fg }]}>{title}</Text>
              <Text style={[styles.categorySub, { color: fg }]}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statIcon}>
              <ScanLine size={20} color={DARK_GREEN} />
            </View>
            <Text style={styles.statNum}>{today.length}</Text>
            <Text style={styles.statLabel}>Scans today</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIcon}>
              <Recycle size={20} color={DARK_GREEN} />
            </View>
            <Text style={styles.statNum}>{itemsToday}</Text>
            <Text style={styles.statLabel}>Items today</Text>
          </View>
        </View>

        {/* Recent scans */}
        <Text style={styles.section}>Recent scans</Text>

        {recent.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Leaf size={26} color={LIGHT_GREEN} />
            </View>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.empty}>Tap "Scan waste" to get started.</Text>
          </View>
        )}

        {recent.map((item) => (
          <TouchableOpacity
            key={item.id}
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
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },

  // greeting
  hello: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  helloSub: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 20,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: { color: "#166534", fontWeight: "600", fontSize: 12 },

  hero: {
    backgroundColor: DARK_GREEN,
    borderRadius: 25,
    padding: 24,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: DARK_GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroWatermark: {
    position: "absolute",
    right: -30,
    bottom: -30,
    width: 180,
    height: 180,
    opacity: 0.15,
  },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  heroSub: { color: "#C8E6D5", fontSize: 14, marginTop: 4, marginBottom: 20 },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
  },
  heroBtnText: { color: DARK_GREEN, fontSize: 15, fontWeight: "700" },

  categoriesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DARK_GREEN,
    marginTop: 12,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    width: "48%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  categoryTitle: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  categorySub: { fontSize: 12, marginTop: 4, opacity: 0.75 },

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
    fontSize: 18,
    fontWeight: "700",
    color: DARK_GREEN,
    marginTop: 28,
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#F3F8F4",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
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
});