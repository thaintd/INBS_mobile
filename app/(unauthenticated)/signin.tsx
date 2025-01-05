import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";

export default function SignIn() {
  const router = useRouter();

  const handleSignIn = () => {
    // Thêm logic đăng nhập ở đây
    router.push("/(authenticated)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Phone" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Password" secureTextEntry placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <Text onPress={() => router.push("/signup")} style={styles.forgotPassword}>
        Forgot password?
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={styles.signupText} onPress={() => router.push("/signup")}>
        Don't have an account? Sign Up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.sixth,
    marginBottom: 16
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 20
  },
  forgotPassword: {
    color: colors.fifth,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 16
  },
  signupText: {
    marginTop: 16,
    color: colors.fifth,
    textAlign: "center",
    fontSize: 16
  },
  button: {
    backgroundColor: colors.fifth,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center"
  },
  buttonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "bold"
  }
});
