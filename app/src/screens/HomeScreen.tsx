import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  Camera,
  ScanLine,
  Recycle,
  ChevronRight,
  Leaf,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Lightbulb,
} from "lucide-react-native";
import { getHistory, HistoryItem } from "../utils/storage";
import { isUnsure } from "../ml/confidence";
import logo from "../../assets/Gigo.png";
import AppHeader from "../components/AppHeader";

const DARK_GREEN = "#1B6045";
const LIGHT_GREEN = "#76C255";

const CATEGORIES = [
  {
    title: "Biodegradable",
    sub: "Food scraps, leaves",
    Icon: Leaf,
    bg: "#EFF6E6",
    fg: "#2F5D2A",
    about: "Organic waste that breaks down naturally and can be composted.",
    examples: [
      "Food scraps",
      "Fruit and vegetable peels",
      "Leaves and grass clippings",
      "Eggshells",
      "Coffee grounds",
    ],
    tip: "Keep it separate from plastics so it can be composted.",
  },
  {
    title: "Recyclable",
    sub: "Paper, clean bottles",
    Icon: Recycle,
    bg: "#E7F1FD",
    fg: "#1E4E8C",
    about: "Materials that can be processed and made into new products.",
    examples: [
      "Paper and cardboard",
      "Clean plastic bottles",
      "Glass bottles and jars",
      "Aluminum and tin cans",
    ],
    tip: "Rinse and dry items before putting them in the recycling bin.",
  },
  {
    title: "Residual",
    sub: "Non-recyclable waste",
    Icon: Trash2,
    bg: "#EFEFEF",
    fg: "#111827",
    about:
      "Waste that can't be composted or recycled and usually ends up in a landfill.",
    examples: [
      "Used tissues",
      "Snack wrappers and sachets",
      "Styrofoam",
      "Diapers and sanitary pads",
      "Broken ceramics",
    ],
    tip: "Cut down on residual waste by choosing reusable items.",
  },
  {
    title: "Special Waste",
    sub: "Batteries, e-waste",
    Icon: AlertTriangle,
    bg: "#FCEBE6",
    fg: "#8B2E1F",
    about: "Hazardous or electronic waste that needs safe handling and disposal.",
    examples: [
      "Batteries",
      "Old phones and electronics",
      "Light bulbs",
      "Paint and chemicals",
      "Medical waste",
    ],
    tip: "Never put these in regular trash. Bring them to a proper drop-off point.",
  },
];

type Category = (typeof CATEGORIES)[number];

function isToday(ts: number) {
  return new Date(ts).toDateString() === new Date().toDateString();
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, []),
  );

  const openCategory = (c: Category) => {
    setSelected(c);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const today = history.filter((h) => isToday(h.timestamp));
  const itemsToday = today.reduce(
    (sum, h) => sum + h.detections.filter((d) => !isUnsure(d)).length,
    0,
  );
  const recent = history.slice(0, 3);

  return (
    <View style={styles.container}>
      <AppHeader />

      {/* Category details modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeModal} />

          {selected && (
            <View style={styles.sheet}>
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={[styles.sheetIcon, { backgroundColor: selected.bg }]}>
                  <selected.Icon size={26} color={selected.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTitle}>{selected.title}</Text>
                  <Text style={styles.sheetSub}>{selected.sub}</Text>
                </View>
                <TouchableOpacity
                  onPress={closeModal}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.closeBtn}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetAbout}>{selected.about}</Text>

              {/* Examples */}
              <Text style={styles.sheetLabel}>What goes here</Text>
              <View style={[styles.examples, { backgroundColor: selected.bg }]}>
                {selected.examples.map((ex) => (
                  <View key={ex} style={styles.exampleRow}>
                    <Check size={16} color={selected.fg} />
                    <Text style={[styles.exampleText, { color: selected.fg }]}>
                      {ex}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tip */}
              <View style={styles.tipBox}>
                <Lightbulb size={18} color={DARK_GREEN} />
                <Text style={styles.tipText}>{selected.tip}</Text>
              </View>

              <TouchableOpacity
                style={[styles.gotItBtn, { backgroundColor: selected.fg }]}
                activeOpacity={0.9}
                onPress={closeModal}
              >
                <Text style={styles.gotItText}>Got it</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

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
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.title}
              activeOpacity={0.8}
              onPress={() => openCategory(c)}
              style={[styles.categoryCard, { backgroundColor: c.bg }]}
            >
              <c.Icon size={20} color={c.fg} />
              <Text style={[styles.categoryTitle, { color: c.fg }]}>
                {c.title}
              </Text>
              <Text style={[styles.categorySub, { color: c.fg }]}>{c.sub}</Text>
            </TouchableOpacity>
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

  // categories
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

  // category modal
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  sheetSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetAbout: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    marginBottom: 18,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  examples: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  exampleText: { fontSize: 15, fontWeight: "500" },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F3F8F4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20, color: "#374151" },
  gotItBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  gotItText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // stats
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