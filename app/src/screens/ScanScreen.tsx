import { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Camera,
  Image as ImageIcon,
  WifiOff,
  ScanLine,
  Sun,
  Package,
  Maximize,
} from "lucide-react-native";
import { detect } from "../ml/detect";
import { saveScan } from "../utils/storage";
import AppHeader from "../components/AppHeader";

const DARK_GREEN = "#1B6045";
const LIGHT_GREEN = "#76C255";

const TIPS = [
  { Icon: Sun, text: "Good lighting" },
  { Icon: Package, text: "One item at a time" },
  { Icon: Maximize, text: "Fill the frame" },
];

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);

  // Hide top header navigation bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // "Start scanning" buttons pass { autoStart: true } to open the camera right away
  useEffect(() => {
    if (route.params?.autoStart) {
      navigation.setParams({ autoStart: undefined });
      takePhoto();
    }
  }, [route.params?.autoStart]);

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
      <AppHeader title={<Text style={styles.title}>Scan waste</Text>} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sub}>
          Take a photo or choose one from your gallery.
        </Text>

        <View style={styles.badge}>
          <WifiOff size={13} color="#166534" />
          <Text style={styles.badgeText}> Works offline</Text>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={DARK_GREEN} />
              <Text style={styles.loadingTitle}>Analyzing…</Text>
              <Text style={styles.loadingSub}>Detecting waste on your phone</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <View style={styles.scanIcon}>
                <ScanLine size={36} color={DARK_GREEN} />
              </View>
              <Text style={styles.vfTitle}>Point at your trash</Text>
              <Text style={styles.vfSub}>
                We'll tell you what it is and which bin it goes in.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.primary, loading && styles.disabled]}
          onPress={takePhoto}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.primaryText}>Take photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondary, loading && styles.disabled]}
          onPress={pickImage}
          disabled={loading}
          activeOpacity={0.85}
        >
          <ImageIcon size={20} color="#111827" />
          <Text style={styles.secondaryText}>Choose from gallery</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsRow}>
          {TIPS.map(({ Icon, text }) => (
            <View key={text} style={styles.tip}>
              <View style={styles.tipIcon}>
                <Icon size={18} color={DARK_GREEN} />
              </View>
              <Text style={styles.tipText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const CORNER = 28;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingBottom: 40 },

  title: { fontSize: 20, fontWeight: "800", color: DARK_GREEN },
  sub: { fontSize: 15, color: "#6B7280" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
    marginBottom: 20,
  },
  badgeText: { color: "#166534", fontWeight: "600", fontSize: 12 },

  viewfinder: {
    height: 280,
    borderRadius: 24,
    backgroundColor: "#F3F8F4",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  center: { alignItems: "center" },
  scanIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  vfTitle: { fontSize: 18, fontWeight: "700", color: DARK_GREEN },
  vfSub: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 240,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_GREEN,
    marginTop: 16,
  },
  loadingSub: { fontSize: 14, color: "#6B7280", marginTop: 4 },

  // viewfinder corner brackets
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: LIGHT_GREEN,
  },
  tl: {
    top: 16,
    left: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  tr: {
    top: 16,
    right: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bl: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  br: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },

  primary: {
    height: 52,
    borderRadius: 26,
    backgroundColor: DARK_GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  secondary: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E5E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },
  secondaryText: { color: "#111827", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },

  tipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  tip: { flex: 1, alignItems: "center", gap: 8 },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F8F4",
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: { fontSize: 12, color: "#6B7280", textAlign: "center" },
});