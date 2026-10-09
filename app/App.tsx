import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Home as HomeIcon,
  ScanLine,
  Trophy,
} from "lucide-react-native";

import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ScanScreen from "./src/screens/ScanScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ResultScreen from "./src/screens/ResultScreen";
import IntroScreen from "./src/screens/IntroScreen";

const DARK_GREEN = "#1B6045";
const TAB_ICON_SIZE = 20; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: DARK_GREEN,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false, 
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} size={TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <ScanLine color={color} size={TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Trophy color={color} size={TAB_ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // Preload the on-device model (must live inside the component)
  useEffect(() => {
    try {
      require("./src/ml/onnx").loadModel();
    } catch {}
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Intro">
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: "Reset password", headerShadowVisible: false }}
          />
          <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Result" component={ResultScreen} />
          {/* History is no longer a tab; still reachable from the Home menu */}
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
