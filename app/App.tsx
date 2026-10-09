import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/HomeScreen";
import ScanScreen from "./src/screens/ScanScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ResultScreen from "./src/screens/ResultScreen";
import { initAi } from "./src/ai";

const LLM_PATH =
  "/sdcard/Android/data/com.markvincentcleofe06.app/files/Llama-3.2-1B-Instruct-Q4_K_M.gguf";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#16A34A" }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [status, setStatus] = useState("Starting...");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(() => {
    setError(null);
    setStatus("Starting...");
    initAi({ llmModelPath: LLM_PATH, onProgress: setStatus })
      .then(() => setReady(true))
      .catch((e: any) => setError(e?.message ?? String(e)));
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>GIGO</Text>
        {error ? (
          <>
            <Text style={styles.error}>AI failed to load</Text>
            <Text style={styles.detail}>{error}</Text>
            <TouchableOpacity style={styles.retry} onPress={start}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator
              size="large"
              color="#16A34A"
              style={{ marginVertical: 16 }}
            />
            <Text style={styles.status}>{status}</Text>
            <Text style={styles.detail}>
              Loading on-device AI. No internet needed.
            </Text>
          </>
        )}
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Result" component={ResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F8F4",
    padding: 24,
  },
  brand: { fontSize: 40, fontWeight: "900", color: "#14532D" },
  status: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
  },
  detail: { fontSize: 13, color: "#6B7280", marginTop: 8, textAlign: "center" },
  error: { fontSize: 18, fontWeight: "700", color: "#DC2626", marginTop: 16 },
  retry: {
    marginTop: 20,
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
