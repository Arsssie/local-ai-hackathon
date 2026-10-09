import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Trophy, Crown, Recycle } from "lucide-react-native";
import { getHistory } from "../utils/storage";
import { isUnsure } from "../ml/confidence";
import AppHeader from "../components/AppHeader";

const DARK_GREEN = "#1B6045";
const LIGHT_GREEN = "#76C255";

type Entry = { name: string; points: number; isYou?: boolean };

// Sample data for now (no backend yet). Replace with real data later.
const SAMPLE: Entry[] = [
  { name: "Maria S.", points: 128 },
  { name: "Jun R.", points: 104 },
  { name: "Ate Lorna", points: 87 },
  { name: "Carlo D.", points: 65 },
  { name: "Bea T.", points: 52 },
  { name: "Migs L.", points: 38 },
  { name: "Nica P.", points: 21 },
];

const PODIUM_COLORS = ["#F5C242", "#B8C2CC", "#D9985F"]; // gold, silver, bronze

function initials(name: string) {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function LeaderboardScreen() {
  const [myPoints, setMyPoints] = useState(0);

  // Your points = number of items you've sorted (confident detections only)
  useFocusEffect(
    useCallback(() => {
      getHistory().then((history) =>
        setMyPoints(
          history.reduce(
            (sum, h) => sum + h.detections.filter((d) => !isUnsure(d)).length,
            0,
          ),
        ),
      );
    }, []),
  );

  const ranked = [...SAMPLE, { name: "You", points: myPoints, isYou: true }]
    .sort((a, b) => b.points - a.points)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const me = ranked.find((e) => e.isYou)!;


  const podium = [top3[1], top3[0], top3[2]];
  const heights = [88, 116, 70];

  return (
    <View style={styles.container}>
      <AppHeader
        title={
          <View style={styles.titleRow}>
            <Trophy size={20} color={DARK_GREEN} />
            <Text style={styles.title}>Leaderboard</Text>
          </View>
        }
      />
      <View style={styles.header}>
        <Text style={styles.subtitle}>Top eco buddies by items sorted</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Your rank */}
        <View style={styles.meCard}>
          <View>
            <Text style={styles.meLabel}>Your rank</Text>
            <Text style={styles.meRank}>#{me.rank}</Text>
          </View>
          <View style={styles.mePoints}>
            <Recycle size={18} color="#fff" />
            <Text style={styles.mePointsText}>{me.points} items</Text>
          </View>
        </View>

        {/* Podium */}
        <View style={styles.podium}>
          {podium.map((e, i) => {
            const place = e.rank - 1; // 0 = gold
            return (
              <View key={e.name} style={styles.podiumCol}>
                {e.rank === 1 && <Crown size={22} color="#F5C242" />}
                <View
                  style={[
                    styles.avatar,
                    {
                      borderColor: PODIUM_COLORS[place],
                      width: e.rank === 1 ? 64 : 52,
                      height: e.rank === 1 ? 64 : 52,
                      borderRadius: e.rank === 1 ? 32 : 26,
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>{initials(e.name)}</Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {e.name}
                </Text>
                <View
                  style={[
                    styles.block,
                    { height: heights[i], backgroundColor: PODIUM_COLORS[place] },
                  ]}
                >
                  <Text style={styles.blockRank}>{e.rank}</Text>
                  <Text style={styles.blockPoints}>{e.points}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Rest of the list */}
        {rest.map((e) => (
          <View
            key={e.name}
            style={[styles.row, e.isYou && styles.rowYou]}
          >
            <Text style={styles.rowRank}>{e.rank}</Text>
            <View style={styles.rowAvatar}>
              <Text style={styles.rowAvatarText}>{initials(e.name)}</Text>
            </View>
            <Text style={styles.rowName} numberOfLines={1}>
              {e.name}
              {e.isYou ? " (you)" : ""}
            </Text>
            <Text style={styles.rowPoints}>{e.points}</Text>
          </View>
        ))}

        <Text style={styles.note}>
          Updated as of .......
        
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "800", color: DARK_GREEN },
  subtitle: { fontSize: 14, color: "#6B7280" },

  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },

  meCard: {
    backgroundColor: DARK_GREEN,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  meLabel: { color: "#C8E6D5", fontSize: 13 },
  meRank: { color: "#fff", fontSize: 32, fontWeight: "800" },
  mePoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
  },
  mePointsText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  podiumCol: { flex: 1, alignItems: "center" },
  avatar: {
    backgroundColor: "#F3F8F4",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  avatarText: { color: DARK_GREEN, fontWeight: "800", fontSize: 16 },
  podiumName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  block: {
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  blockRank: { fontSize: 24, fontWeight: "800", color: "#fff" },
  blockPoints: { fontSize: 12, fontWeight: "600", color: "#fff" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F8F4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 12,
  },
  rowYou: { backgroundColor: "#E3F3DA", borderWidth: 1.5, borderColor: LIGHT_GREEN },
  rowRank: { width: 22, fontSize: 15, fontWeight: "700", color: "#6B7280" },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  rowAvatarText: { color: DARK_GREEN, fontWeight: "700", fontSize: 13 },
  rowName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111827" },
  rowPoints: { fontSize: 16, fontWeight: "800", color: DARK_GREEN },

  note: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
});