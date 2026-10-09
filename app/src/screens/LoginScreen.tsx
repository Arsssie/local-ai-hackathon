import { useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Mail, Lock, Eye, EyeOff, Globe, User } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import logo from "../../assets/Gigo-Logo.png";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI only: no backend yet, so these just go to the app
  const goToApp = () =>
    navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });

  const handleLogin = () => goToApp();
  const handleGoogle = () => {
    // TODO: Google sign-in
  };
  const handleGuest = () => goToApp();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Garbage in, Garbage out</Text>
        </View>

        <View style={styles.inputWrap}>
          <Mail size={22} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrap}>
          <Lock size={22} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
            {showPassword ? (
              <Eye size={22} color="#6B7280" />
            ) : (
              <EyeOff size={22} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgot}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
          <Globe size={20} color="#185811" />
          <Text style={styles.altText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
          <User size={20} color="#111827" />
          <Text style={styles.altText}>Continue as Eco Buddy</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const DARK_GREEN = "#1B6045";
const LIGHT_GREEN = "#76C255";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 48 },
  logo: { width: 150, height: 150 },
  tagline: { fontSize: 15, color: "#6B7280", marginTop: 6 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 52,
    borderWidth: 1,
    borderColor: "#6B7280",
    borderRadius: 26,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  input: { flex: 1, fontSize: 15, color: "#111827" },

  forgot: { alignSelf: "flex-end", marginTop: -6, marginRight: 6 },
  forgotText: { color: DARK_GREEN, fontSize: 14, fontWeight: "600" },

  loginBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: DARK_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  loginText: { color: "#fff", fontSize: 17, fontWeight: "600" },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginVertical: 36,
  },
  line: { flex: 1, height: 1, backgroundColor: "#6B7280" },
  or: { color: "#6B7280", fontSize: 14 },

  googleBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E5E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  guestBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: LIGHT_GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  altText: { color: "#111827", fontSize: 15, fontWeight: "600" },
});