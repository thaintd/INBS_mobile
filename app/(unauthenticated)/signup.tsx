import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

export default function SignUp() {
  const router = useRouter();

  const handleSignUp = () => {
    // Thêm logic đăng ký ở đây
    router.push("/signin");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Mail" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Password" secureTextEntry placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Confirm Password" secureTextEntry placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Full Name" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Phone Number" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.signupText} onPress={() => router.push("/signin")}>
        Already have an account? Sign in
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
    alignItems: "center",
    marginTop: 16
  },
  buttonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "bold"
  }
});
