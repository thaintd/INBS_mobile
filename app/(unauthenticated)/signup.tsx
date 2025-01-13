import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/images/newlogo.png")} style={styles.logo} />
          <Text style={styles.slogan}>Nail Beauty Service</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.fifth} />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={`${colors.fifth}80`} value={fullName} onChangeText={setFullName} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.fifth} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={`${colors.fifth}80`} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.fifth} />
            <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={`${colors.fifth}80`} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.fifth} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={`${colors.fifth}80`} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.fifth} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.fifth} />
            <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={`${colors.fifth}80`} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.fifth} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={() => router.push("/(authenticated)")}>
            <Text style={styles.signUpText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={() => router.push("/signin")}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.third
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain"
  },
  slogan: {
    fontSize: 16,
    color: colors.fifth,
    marginTop: 8,
    letterSpacing: 1
  },
  formContainer: {
    flex: 1
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.fifth}10`,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
    borderWidth: 1,
    borderColor: `${colors.fifth}20`
  },
  input: {
    flex: 1,
    color: colors.fifth,
    marginLeft: 12,
    fontSize: 16
  },
  signUpButton: {
    backgroundColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  signUpText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "600"
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.fourth
  },
  orText: {
    color: colors.fifth,
    marginHorizontal: 16,
    fontSize: 14
  },
  signInButton: {
    borderWidth: 1,
    borderColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.fifth}10`
  },
  signInText: {
    color: colors.fifth,
    fontSize: 16,
    fontWeight: "500"
  }
});
