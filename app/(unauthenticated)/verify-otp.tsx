import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { router } from "expo-router";
import colors from "@/assets/colors/colors";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/logo3.png")} style={styles.logo} />
        <Text style={styles.slogan}>Nail Beauty Service</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your phone</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => {
                const newOtp = [...otp];
                newOtp[index] = text;
                setOtp(newOtp);
              }}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={() => router.replace("/home")}>
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>Resend OTP</Text>
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
    flex: 1,
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.fifth,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.eigth,
    marginBottom: 32,
    textAlign: "center"
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 24
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: colors.fifth,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    color: colors.eigth
  },
  verifyButton: {
    backgroundColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  verifyText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "600"
  },
  resendButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: `${colors.fifth}10`
  },
  resendText: {
    color: colors.fifth,
    fontSize: 16,
    fontWeight: "500"
  }
});
