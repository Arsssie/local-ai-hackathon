import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { detect } from "../ml/detect";
import { saveScan } from "../utils/storage";

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  async function runDetection(uri: string) {
    setLoading(true);
    try {
      const result = await detect(uri);
      await saveScan(result);
      navigation.navigate("Result", { result });
    } catch (e) {
      console.warn("scan error", e);
      Alert.alert("Scan failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Camera permission needed",
        "Allow camera access to scan waste.",
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) runDetection(res.assets[0].uri);
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!res.canceled) runDetection(res.assets[0].uri);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan your waste</Text>
      <Text style={styles.sub}>
        Take a photo or choose one from your gallery.
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#16A34A"
          style={{ marginTop: 32 }}
        />
      ) : (
        <>
          <TouchableOpacity style={styles.primary} onPress={takePhoto}>
            <Text style={styles.primaryText}>Take photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={pickImage}>
            <Text style={styles.secondaryText}>Choose from gallery</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F3F8F4",
  },
  title: { fontSize: 26, fontWeight: "700", color: "#14532D" },
  sub: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 8,
    marginBottom: 32,
    textAlign: "center",
  },
  primary: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondary: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#16A34A",
  },
  secondaryText: { color: "#16A34A", fontSize: 17, fontWeight: "700" },
});
