import { View, Text, StyleSheet } from "react-native";

export default function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F8F4",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#14532D" },
});
