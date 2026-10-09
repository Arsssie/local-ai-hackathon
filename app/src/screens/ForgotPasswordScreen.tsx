import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  
  const handleSend = () => setSent(true);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name={sent ? "checkmark" : "lock-open-outline"}
            size={40}
            color="#fff"
          />
        </View>

        <Text style={styles.title}>
          {sent ? "Check your email" : "Forgot password?"}
        </Text>
        <Text style={styles.subtitle}>
          {sent
            ? `If an account exists for ${email.trim()}, we've sent a link to reset your password.`
            : "Enter your email and we'll send you a link to reset your password."}
        </Text>

        {!sent && (
          <>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={22} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={handleSend}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSend}>
              <Text style={styles.primaryText}>Send reset link</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={sent ? styles.primaryBtn : styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={sent ? styles.primaryText : styles.backText}>
            Back to login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const DARK_GREEN = "#1B6045";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
    justifyContent: "center",
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: DARK_GREEN,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: DARK_GREEN,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
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
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: DARK_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  backBtn: { alignItems: "center", paddingVertical: 18 },
  backText: { color: DARK_GREEN, fontSize: 15, fontWeight: "600" },
});