import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { ScanResult } from "../ml/types";
import { isUnsure } from "../ml/confidence";
import DetectionImage from "../components/DetectionImage";
import classes from "../data/classes.json";

export default function ResultScreen() {
  const route = useRoute<any>();
  const result: ScanResult = route.params.result;
  const sure = result.detections.filter((d) => !isUnsure(d));
  const unsure = result.detections.filter(isUnsure);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <DetectionImage uri={result.imageUri} detections={sure} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          On-device · Offline · {result.inferenceMs} ms
        </Text>
      </View>

      {sure.length === 0 && (
        <View style={styles.unsureCard}>
          <Text style={styles.unsureTitle}>Not sure about this one</Text>
          <Text style={styles.unsureText}>
            Try a closer, brighter photo with one item in frame.
            {unsure[0]
              ? ` Best guess: ${unsure[0].label} (${Math.round(unsure[0].confidence * 100)}%)`
              : ""}
          </Text>
        </View>
      )}

      {sure.map((d, i) => {
        const info = (classes as any)[d.category ?? d.label];
        return (
          <View
            key={i}
            style={[styles.card, { borderLeftColor: info?.color ?? "#9CA3AF" }]}
          >
            <Text style={styles.label}>{d.label}</Text>
            <Text style={styles.category}>{info?.category ?? "Unknown"}</Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.round(d.confidence * 100)}%`,
                    backgroundColor: info?.color ?? "#9CA3AF",
                  },
                ]}
              />
            </View>
            <Text style={styles.conf}>
              {Math.round(d.confidence * 100)}% confident
            </Text>
            {info?.tip && <Text style={styles.tip}>{info.tip}</Text>}
            {info?.pesoPerKg && (
              <Text style={styles.peso}>
                ≈ ₱{info.pesoPerKg}/kg at a junk shop (estimate)
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F8F4" },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 12,
  },
  badgeText: { color: "#166534", fontWeight: "600", fontSize: 13 },
  empty: { color: "#6B7280", marginTop: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  category: { fontSize: 14, color: "#4B5563", marginBottom: 10 },
  barBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },
  conf: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  tip: { fontSize: 14, color: "#374151", marginTop: 10 },
  peso: { fontSize: 13, fontWeight: "600", color: "#166534", marginTop: 8 },
  unsureCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#F59E0B",
  },
  unsureTitle: { fontSize: 18, fontWeight: "700", color: "#92400E" },
  unsureText: { fontSize: 14, color: "#78350F", marginTop: 4 },
});
