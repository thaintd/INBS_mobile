import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as Notifications from "expo-notifications";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deviceToken, setDeviceToken] = useState("");

  useEffect(() => {
    const getDeviceToken = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
      let token = (await Notifications.getExpoPushTokenAsync()).data;
      token = token.match(/\[(.*?)\]/)[1]; // Chỉ lấy nội dung trong dấu ngoặc vuông
      setDeviceToken(token);
      console.log("Device token:", token);
    };
    getDeviceToken();
  }, []);

  const handleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await api.post("/api/Authentication/customer/login", formData);
      if (response.data.accessToken) {
        await AsyncStorage.setItem("token", response.data.accessToken);
        const decodedToken = jwtDecode(response.data.accessToken);
        const userID = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        if (userID) {
          await AsyncStorage.setItem("userID", userID);
        }

        console.log("User ID:", userID);
        const PlatformType = 0;

        if (deviceToken) {
          await api.post("/api/DeviceToken", { PlatformType, Token: deviceToken });
          console.log("Device token sent successfully");
        }
      }

      router.replace("/home");
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/logo3.png")} style={styles.logo} />
        <Text style={styles.slogan}>Nail Beauty Service</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={colors.eigth} />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={`${colors.eigth}80`}
            value={formData.phoneNumber}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, phoneNumber: text }));
              setError("");
            }}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.eigth} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={`${colors.eigth}80`}
            value={formData.password}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, password: text }));
              setError("");
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.eigth} />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.signInButton, loading && styles.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.signInText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push("/(unauthenticated)/signup")} disabled={loading}>
          <Text style={styles.signUpText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sixth,
    padding: 20
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40
  },
  logo: {
    width: 150,
    height: 150,
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
    color: colors.eigth,
    marginLeft: 12,
    fontSize: 16
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center"
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 24
  },
  forgotPasswordText: {
    color: colors.fifth,
    fontSize: 14
  },
  signInButton: {
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
  buttonDisabled: {
    opacity: 0.5
  },
  signInText: {
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
  signUpButton: {
    borderWidth: 1,
    borderColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.fifth}10`
  },
  signUpText: {
    color: colors.fifth,
    fontSize: 16,
    fontWeight: "500"
  }
});
