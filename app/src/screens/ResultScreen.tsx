import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { ScanResult } from "../ml/types";
import classes from "../data/classes.json";

export default function ResultScreen() {
  const route = useRoute<any>();
  const result: ScanResult = route.params.result;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <Image source={{ uri: result.imageUri }} style={styles.image} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          On-device · Offline · {result.inferenceMs} ms
        </Text>
      </View>

      {result.detections.length === 0 && (
        <Text style={styles.empty}>
          Nothing detected. Try a closer, brighter photo.
        </Text>
      )}

      {result.detections.map((d, i) => {
        const info = (classes as any)[d.label];
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
});
